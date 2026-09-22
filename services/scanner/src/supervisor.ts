import { randomBytes } from 'node:crypto';
import {
  ScanReport,
  computeReportIntegrity,
  validateReportSemantics,
  ScanReportSchema,
} from '@webspor/contracts';
import {
  validateAndNormalizeTargetUrl,
  redactObservations,
  classifyObservations,
  calculateIndicators,
  RULESET_VERSION,
  REDACTION_VERSION,
} from '@webspor/rules';
import { ScanWorker } from './worker.js';

export const ENGINE_VERSION = '1.0.0';
export const SCAN_PROFILE_VERSION = 'baseline-v1';

export class ScanSupervisor {
  private worker = new ScanWorker();

  public async executeScan(targetUrl: string, scanId?: string): Promise<ScanReport> {
    const startedAt = new Date().toISOString();
    const id = scanId || `scan-${randomBytes(12).toString('hex')}`;

    // 1. Validation
    const val = validateAndNormalizeTargetUrl(targetUrl, false);
    if (!val.valid || !val.canonicalUrl || !val.origin) {
      throw new Error(`Ugyldigt mål: ${val.errorMessage || val.errorCode}`);
    }

    const requestedOrigin = val.origin;

    // 2. Execute worker with 45-second timeout
    const workerPromise = this.worker.runScan(val.canonicalUrl);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('SUPERVISOR_WALL_CLOCK_TIMEOUT')), 45000)
    );

    let workerResult;
    try {
      workerResult = await Promise.race([workerPromise, timeoutPromise]);
    } catch {
      workerResult = {
        observations: [],
        collectors: {
          network: { status: 'failed' as const, reasonCode: 'NAVIGATION_TIMEOUT' },
          cookies: { status: 'not_run' as const },
          storage: { status: 'not_run' as const },
          headers: { status: 'not_run' as const },
          transport: { status: 'failed' as const, reasonCode: 'TIMEOUT' },
        },
        limitations: ['NAVIGATION_TIMEOUT'],
        finalOrigin: requestedOrigin,
        finalHttpStatus: 504,
        finalContentType: 'text/plain',
      };
    }

    const finishedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 min TTL

    // 3. Redact observations
    const redaction = redactObservations(workerResult.observations);
    if (redaction.isTruncated) {
      workerResult.collectors.network.status = 'partial';
      workerResult.collectors.network.droppedCount = redaction.droppedCount;
      if (!workerResult.limitations.includes('RESOURCE_LIMIT')) {
        workerResult.limitations.push('RESOURCE_LIMIT');
      }
    }

    // 4. Calculate indicators
    const scoringOutput = calculateIndicators({
      targetOrigin: requestedOrigin,
      finalOrigin: workerResult.finalOrigin,
      collectors: workerResult.collectors,
      observations: redaction.observations,
      finalHttpStatus: workerResult.finalHttpStatus,
      finalContentType: workerResult.finalContentType,
    });

    // 5. Classify findings
    const findings = classifyObservations(workerResult.finalOrigin, redaction.observations);

    // Determine status: completed, partial, or failed
    const hasCompleteNetwork = workerResult.collectors.network.status === 'complete';
    let status: 'completed' | 'partial' | 'failed' = 'completed';
    if (!hasCompleteNetwork && redaction.observations.length > 0) {
      status = 'partial';
    } else if (redaction.observations.length === 0) {
      status = 'failed';
    }

    const reportRaw: Omit<ScanReport, 'integrity'> = {
      schemaVersion: '1.0.0',
      scanProfileVersion: SCAN_PROFILE_VERSION,
      engineVersion: ENGINE_VERSION,
      rulesetVersion: RULESET_VERSION,
      redactionVersion: REDACTION_VERSION,
      datasetVersions: [],
      id,
      startedAt,
      finishedAt,
      expiresAt,
      status,
      target: {
        requestedOrigin,
        finalOrigin: workerResult.finalOrigin,
      },
      environment: {
        browserVersion: 'Chromium 130.0.0.0',
        region: process.env.SCANNER_REGION || 'eu-north-1',
        locale: 'da-DK',
        timezone: 'Europe/Copenhagen',
        viewport: { width: 1440, height: 900 },
      },
      collectors: workerResult.collectors,
      limitations: workerResult.limitations,
      observations: redaction.observations,
      findings,
      indicators: scoringOutput.indicators,
    };

    const integrity = computeReportIntegrity(reportRaw as unknown as Record<string, unknown>);
    const finalReport: ScanReport = {
      ...reportRaw,
      integrity,
    };

    // Validate report
    ScanReportSchema.parse(finalReport);
    const semanticErrors = validateReportSemantics(finalReport);
    if (semanticErrors.length > 0) {
      console.error('Semantic validation warning:', semanticErrors);
    }

    return finalReport;
  }
}
