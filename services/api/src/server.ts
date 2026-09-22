import express, { Request, Response, NextFunction } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import { validateAndNormalizeTargetUrl, getRegisterableDomain } from '@webspor/rules';
import { scanStore } from './store.js';

export interface ApiServerOptions {
  allowInternalTesting?: boolean;
}

export function createApiServer(options: ApiServerOptions = {}) {
  const { allowInternalTesting = false } = options;
  const app = express();

  // Limit body size to 4 KiB per api-contract.md
  app.use(express.json({ limit: '4kb' }));

  // Set no-store on all API endpoints
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  // Health endpoint
  app.get('/health/live', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'webspor-api', version: '1.0.0' });
  });

  // POST /v1/scans
  app.post('/v1/scans', (req: Request, res: Response): void => {
    // S-04 / ADR-007 / ADR-008 / ADR-010:
    // Ingen konfiguration må aktivere offentlig scanning før de nødvendige
    // sikkerheds- og driftskrav er opfyldt og verificeret i staging.
    if (!allowInternalTesting) {
      res.status(503).json({
        code: 'SCAN_DISABLED',
        messageKey: 'SCAN_DISABLED',
        retryable: false,
        message: 'Offentlig scanning kan ikke aktiveres via konfiguration alene. Sikkerheds- og driftskrav (ADR-007 microVM/gateway, ADR-008 DPA, ADR-010 driftsbudget) er åbne og ikke verificeret i staging.',
      });
      return;
    }

    // Kill switch within test harness
    const scanEnabled = process.env.SCAN_ENABLED === 'true';
    if (!scanEnabled) {
      res.status(503).json({
        code: 'SCAN_DISABLED',
        messageKey: 'SCAN_DISABLED',
        retryable: false,
        message: 'Scanning er slået fra af kill switch (SCAN_ENABLED=false).',
      });
      return;
    }

    const { url, profile = 'baseline-v1' } = req.body || {};
    if (profile !== 'baseline-v1') {
      res.status(400).json({ code: 'INVALID_TARGET', message: 'Uunderstøttet profil.' });
      return;
    }

    // URL validation (S-01)
    const validation = validateAndNormalizeTargetUrl(url, false);
    if (!validation.valid || !validation.canonicalUrl) {
      res.status(422).json({
        code: validation.errorCode || 'INVALID_TARGET',
        message: validation.errorMessage || 'Målet kan ikke undersøges.',
      });
      return;
    }

    // IP-HMAC rate limiting (S-04)
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const ipIdentity = scanStore.computeIpIdentity(clientIp);
    const domain = getRegisterableDomain(validation.hostname || '') || validation.hostname || 'unknown';

    // Idempotency check
    const idempotencyKey = req.header('Idempotency-Key');
    const bodyHash = createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

    if (idempotencyKey) {
      const idemp = scanStore.checkIdempotency(`${ipIdentity}:${idempotencyKey}`, bodyHash);
      if (idemp.conflict) {
        res.status(409).json({ code: 'IDEMPOTENCY_CONFLICT', message: 'Samme Idempotency-Key anvendt med forskellig body.' });
        return;
      }
      if (idemp.hit && idemp.job) {
        // Return existing job info and original token per api-contract.md
        res.status(202).json({
          id: idemp.job.id,
          accessToken: idemp.accessToken,
          status: idemp.job.status,
          expiresAt: new Date(idemp.job.expiresAt).toISOString(),
          pollAfterSeconds: idemp.job.pollAfterSeconds,
        });
        return;
      }
    }

    const quota = scanStore.checkQuotas(ipIdentity, domain);
    if (!quota.allowed) {
      if (quota.retryAfterSeconds) {
        res.setHeader('Retry-After', quota.retryAfterSeconds.toString());
      }
      res.status(429).json({
        code: quota.reason || 'RATE_LIMITED',
        message: 'Kvote overskredet for dit netværk eller dette måldomæne.',
        retryAfterSeconds: quota.retryAfterSeconds,
      });
      return;
    }

    // Generate 256-bit cryptographic capability token (S-05)
    const accessToken = randomBytes(32).toString('hex');
    const job = scanStore.createJob(validation.canonicalUrl, accessToken, ipIdentity);
    scanStore.recordScanAttempt(ipIdentity, domain);

    if (idempotencyKey) {
      scanStore.setIdempotency(`${ipIdentity}:${idempotencyKey}`, bodyHash, job, accessToken);
    }

    res.status(202).json({
      id: job.id,
      accessToken,
      status: job.status,
      expiresAt: new Date(job.expiresAt).toISOString(),
      pollAfterSeconds: job.pollAfterSeconds,
    });
  });

  // GET /v1/scans/:id
  app.get('/v1/scans/:id', (req: Request, res: Response): void => {
    const id = String(req.params.id);
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Bearer capability token påkrævet.' });
      return;
    }

    // Tombstone check with timing-safe token verification per api-contract.md
    const tombstone = scanStore.getTombstone(id);
    if (tombstone) {
      if (scanStore.verifyToken(token, tombstone.tokenHash)) {
        res.status(410).json({ code: 'RESULT_EXPIRED', message: 'Rapporten er udløbet og slettet.' });
        return;
      }
      // If token does not match, return 404 to avoid leaking job existence
      res.status(404).json({ code: 'NOT_FOUND', message: 'Undersøgelse ikke fundet eller ugyldigt token.' });
      return;
    }

    const job = scanStore.getJob(id);
    if (!job || !scanStore.verifyToken(token, job.tokenHash)) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Undersøgelse ikke fundet eller ugyldigt token.' });
      return;
    }

    res.status(200).json({
      id: job.id,
      status: job.status,
      expiresAt: new Date(job.expiresAt).toISOString(),
      pollAfterSeconds: job.pollAfterSeconds,
      report: job.report,
      error: job.error,
    });
  });

  // DELETE /v1/scans/:id
  app.delete('/v1/scans/:id', (req: Request, res: Response): void => {
    const id = String(req.params.id);
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Bearer capability token påkrævet.' });
      return;
    }

    // Idempotent deletion per API contract with valid token
    const tombstone = scanStore.getTombstone(id);
    if (tombstone) {
      if (scanStore.verifyToken(token, tombstone.tokenHash)) {
        res.status(204).end();
        return;
      }
      res.status(404).json({ code: 'NOT_FOUND', message: 'Undersøgelse ikke fundet eller ugyldigt token.' });
      return;
    }

    const job = scanStore.getJob(id);
    if (!job || !scanStore.verifyToken(token, job.tokenHash)) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Undersøgelse ikke fundet eller ugyldigt token.' });
      return;
    }

    scanStore.deleteJob(id);
    res.status(204).end();
  });

  return app;
}
