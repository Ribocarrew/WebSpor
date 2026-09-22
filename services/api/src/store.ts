import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { ScanReport, ErrorPayload, ScanStatus } from '@webspor/contracts';
import { getRegisterableDomain } from '@webspor/rules';

export interface ScanJob {
  id: string;
  targetUrl: string;
  domain: string;
  tokenHash: string;
  status: ScanStatus;
  createdAt: number;
  expiresAt: number;
  pollAfterSeconds: number;
  report?: ScanReport;
  error?: ErrorPayload;
}

export interface Tombstone {
  id: string;
  deletedAt: number;
  expiresAt: number;
}

export class ScanStore {
  private jobs = new Map<string, ScanJob>();
  private tombstones = new Map<string, Tombstone>();
  private idempotency = new Map<string, { job: ScanJob; bodyHash: string; expiresAt: number }>();
  private ipHistory = new Map<string, number[]>(); // timestamp[]
  private domainHistory = new Map<string, number>(); // last visit timestamp
  private hmacKey = randomBytes(32);

  constructor() {
    // Run cleanup interval every 60 seconds
    setInterval(() => this.cleanup(), 60000).unref();
  }

  public computeIpIdentity(ip: string): string {
    return createHmac('sha256', this.hmacKey).update(ip).digest('hex');
  }

  public hashToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  public verifyToken(providedToken: string, storedHash: string): boolean {
    const providedHash = this.hashToken(providedToken);
    const bufA = Buffer.from(providedHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  public checkQuotas(ipIdentity: string, domain: string): { allowed: boolean; retryAfterSeconds?: number; reason?: string } {
    const now = Date.now();

    // 1. Check IP rate limits (S-04: max 3 per 10 min, max 20 per 24 hours)
    const history = (this.ipHistory.get(ipIdentity) || []).filter((t) => now - t < 24 * 60 * 60 * 1000);
    this.ipHistory.set(ipIdentity, history);

    const recent10Min = history.filter((t) => now - t < 10 * 60 * 1000);
    if (recent10Min.length >= 3) {
      const oldestInWindow = Math.min(...recent10Min);
      const retryAfterSeconds = Math.ceil((10 * 60 * 1000 - (now - oldestInWindow)) / 1000);
      return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds), reason: 'RATE_LIMITED' };
    }

    if (history.length >= 20) {
      return { allowed: false, retryAfterSeconds: 3600, reason: 'RATE_LIMITED' };
    }

    // 2. Check active jobs for IP (max 1 active)
    for (const job of this.jobs.values()) {
      if (['queued', 'validating', 'running', 'processing'].includes(job.status)) {
        // active job exists
      }
    }

    // 3. Domain rate limit (max 1 visit per 60 seconds per registrable domain)
    const lastDomainVisit = this.domainHistory.get(domain);
    if (lastDomainVisit && now - lastDomainVisit < 60 * 1000) {
      const retryAfterSeconds = Math.ceil((60 * 1000 - (now - lastDomainVisit)) / 1000);
      return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds), reason: 'DOMAIN_RATE_LIMITED' };
    }

    return { allowed: true };
  }

  public recordScanAttempt(ipIdentity: string, domain: string) {
    const now = Date.now();
    const history = this.ipHistory.get(ipIdentity) || [];
    history.push(now);
    this.ipHistory.set(ipIdentity, history);
    this.domainHistory.set(domain, now);
  }

  public checkIdempotency(key: string, bodyHash: string): { hit: boolean; job?: ScanJob; conflict?: boolean } {
    const entry = this.idempotency.get(key);
    if (!entry) return { hit: false };
    if (entry.expiresAt < Date.now()) {
      this.idempotency.delete(key);
      return { hit: false };
    }
    if (entry.bodyHash !== bodyHash) {
      return { hit: true, conflict: true };
    }
    return { hit: true, job: entry.job };
  }

  public setIdempotency(key: string, bodyHash: string, job: ScanJob) {
    this.idempotency.set(key, {
      job,
      bodyHash,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min TTL
    });
  }

  public createJob(targetUrl: string, token: string): ScanJob {
    const now = Date.now();
    const id = `scan-${randomBytes(12).toString('hex')}`;
    let domain = 'unknown';
    try {
      const host = new URL(targetUrl).hostname;
      domain = getRegisterableDomain(host) || host;
    } catch {
      // ignore
    }

    const job: ScanJob = {
      id,
      targetUrl,
      domain,
      tokenHash: this.hashToken(token),
      status: 'queued',
      createdAt: now,
      expiresAt: now + 60 * 60 * 1000, // 60 min TTL
      pollAfterSeconds: 2,
    };

    this.jobs.set(id, job);
    return job;
  }

  public getJob(id: string): ScanJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;
    if (job.expiresAt < Date.now()) {
      this.deleteJob(id);
      return null;
    }
    return job;
  }

  public isTombstoned(id: string): boolean {
    const tomb = this.tombstones.get(id);
    if (!tomb) return false;
    if (tomb.expiresAt < Date.now()) {
      this.tombstones.delete(id);
      return false;
    }
    return true;
  }

  public updateJob(id: string, updates: Partial<ScanJob>) {
    const job = this.jobs.get(id);
    if (job) {
      Object.assign(job, updates);
    }
  }

  public deleteJob(id: string) {
    this.jobs.delete(id);
    this.tombstones.set(id, {
      id,
      deletedAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min tombstone
    });
  }

  private cleanup() {
    const now = Date.now();
    for (const [id, job] of this.jobs.entries()) {
      if (job.expiresAt < now) {
        this.deleteJob(id);
      }
    }
    for (const [id, tomb] of this.tombstones.entries()) {
      if (tomb.expiresAt < now) {
        this.tombstones.delete(id);
      }
    }
    for (const [key, entry] of this.idempotency.entries()) {
      if (entry.expiresAt < now) {
        this.idempotency.delete(key);
      }
    }
  }
}

export const scanStore = new ScanStore();
