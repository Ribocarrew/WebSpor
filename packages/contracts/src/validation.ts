import { ScanReport } from './schema.js';

export interface SemanticValidationError {
  field: string;
  message: string;
}

export function validateReportSemantics(report: ScanReport): SemanticValidationError[] {
  const errors: SemanticValidationError[] = [];

  // 1. Check max observations
  if (report.observations.length > 200) {
    errors.push({
      field: 'observations',
      message: `Maksimalt 200 observationer tilladt, fandt ${report.observations.length}`,
    });
  }

  // 2. Check observation references
  const observationIds = new Set(report.observations.map((o) => o.id));

  for (const finding of report.findings) {
    for (const eid of finding.evidenceIds) {
      if (!observationIds.has(eid)) {
        errors.push({
          field: `findings.${finding.id}.evidenceIds`,
          message: `Finding ${finding.id} refererer til ukendt observation-ID: ${eid}`,
        });
      }
    }
  }

  for (const [indicatorKey, indicator] of Object.entries(report.indicators)) {
    for (const eid of indicator.evidenceIds) {
      if (!observationIds.has(eid)) {
        errors.push({
          field: `indicators.${indicatorKey}.evidenceIds`,
          message: `Indikator ${indicatorKey} refererer til ukendt observation-ID: ${eid}`,
        });
      }
    }
  }

  // 3. Collector status vs Indicator value consistency
  if (report.collectors.network.status !== 'complete' && report.indicators['I-01'].value !== null) {
    errors.push({
      field: 'indicators.I-01.value',
      message: 'I-01 skal være null når netværkscollector ikke er complete',
    });
  }

  if (report.collectors.cookies.status !== 'complete' && report.indicators['I-02'].value !== null) {
    errors.push({
      field: 'indicators.I-02.value',
      message: 'I-02 skal være null når cookiecollector ikke er complete',
    });
  }

  if (report.indicators['I-01'].value === null && report.indicators['I-03'].value !== null) {
    errors.push({
      field: 'indicators.I-03.value',
      message: 'I-03 skal være null når I-01 er null',
    });
  }

  const headersComplete = report.collectors.headers.status === 'complete';
  const transportComplete = report.collectors.transport.status === 'complete';
  if ((!headersComplete || !transportComplete) && report.indicators['I-04'].value !== null) {
    errors.push({
      field: 'indicators.I-04.value',
      message: 'I-04 skal være null når headers eller transport collector ikke er complete',
    });
  }

  // 4. Timestamp monotonicity
  const started = new Date(report.startedAt).getTime();
  const finished = new Date(report.finishedAt).getTime();
  const expires = new Date(report.expiresAt).getTime();

  if (started > finished) {
    errors.push({
      field: 'startedAt/finishedAt',
      message: 'startedAt må ikke være senere end finishedAt',
    });
  }

  if (finished > expires) {
    errors.push({
      field: 'finishedAt/expiresAt',
      message: 'finishedAt må ikke være senere end expiresAt',
    });
  }

  // 5. Target validation: no path/query/fragment
  try {
    const reqUrl = new URL(report.target.requestedOrigin);
    if (reqUrl.pathname !== '/' && reqUrl.pathname !== '') {
      errors.push({ field: 'target.requestedOrigin', message: 'requestedOrigin må ikke indeholde sti' });
    }
    if (reqUrl.search || reqUrl.hash) {
      errors.push({ field: 'target.requestedOrigin', message: 'requestedOrigin må ikke indeholde query eller fragment' });
    }
  } catch {
    errors.push({ field: 'target.requestedOrigin', message: 'Ugyldig URL for requestedOrigin' });
  }

  try {
    const finUrl = new URL(report.target.finalOrigin);
    if (finUrl.pathname !== '/' && finUrl.pathname !== '') {
      errors.push({ field: 'target.finalOrigin', message: 'finalOrigin må ikke indeholde sti' });
    }
    if (finUrl.search || finUrl.hash) {
      errors.push({ field: 'target.finalOrigin', message: 'finalOrigin må ikke indeholde query eller fragment' });
    }
  } catch {
    errors.push({ field: 'target.finalOrigin', message: 'Ugyldig URL for finalOrigin' });
  }

  return errors;
}
