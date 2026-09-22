import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ScanReport,
  ScanReportSchema,
  computeReportIntegrity,
  validateReportSemantics,
  Observation,
} from '@webspor/contracts';
import { classifyObservations } from '@webspor/rules';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- 1. SUCCESS FIXTURE ---
const successObservations: Observation[] = [
  {
    id: 'obs-net-001',
    kind: 'request_attempt',
    collector: 'network',
    observedAt: '2026-09-22T12:00:00.100Z',
    data: {
      requestRef: 'req-01',
      origin: 'https://skole.example',
      method: 'GET',
      resourceType: 'document',
      relativeTimeMs: 100,
    },
  },
  {
    id: 'obs-net-002',
    kind: 'response_received',
    collector: 'network',
    observedAt: '2026-09-22T12:00:00.350Z',
    data: {
      requestRef: 'req-01',
      origin: 'https://skole.example',
      status: 200,
      relativeTimeMs: 350,
      mimeType: 'text/html',
    },
  },
  {
    id: 'obs-trans-001',
    kind: 'transport',
    collector: 'transport',
    observedAt: '2026-09-22T12:00:00.355Z',
    data: {
      finalScheme: 'https',
      tlsStatus: 'valid',
      downgraded: false,
    },
  },
  {
    id: 'obs-hdr-hsts',
    kind: 'header_check',
    collector: 'headers',
    observedAt: '2026-09-22T12:00:00.360Z',
    data: {
      headerName: 'Strict-Transport-Security',
      present: true,
      parserStatus: 'valid',
      normalizedDirectives: { 'max-age': 31536000, includeSubDomains: true },
    },
  },
  {
    id: 'obs-hdr-csp',
    kind: 'header_check',
    collector: 'headers',
    observedAt: '2026-09-22T12:00:00.365Z',
    data: {
      headerName: 'Content-Security-Policy',
      present: true,
      parserStatus: 'valid',
      normalizedDirectives: {
        'default-src': "'self'",
        'frame-ancestors': "'self'",
      },
    },
  },
  {
    id: 'obs-hdr-ref',
    kind: 'header_check',
    collector: 'headers',
    observedAt: '2026-09-22T12:00:00.370Z',
    data: {
      headerName: 'Referrer-Policy',
      present: true,
      parserStatus: 'valid',
      normalizedDirectives: { policy: 'strict-origin-when-cross-origin' },
    },
  },
  {
    id: 'obs-hdr-nosniff',
    kind: 'header_check',
    collector: 'headers',
    observedAt: '2026-09-22T12:00:00.375Z',
    data: {
      headerName: 'X-Content-Type-Options',
      present: true,
      parserStatus: 'valid',
      normalizedDirectives: { value: 'nosniff' },
    },
  },
  {
    id: 'obs-hdr-xfo',
    kind: 'header_check',
    collector: 'headers',
    observedAt: '2026-09-22T12:00:00.380Z',
    data: {
      headerName: 'X-Frame-Options',
      present: true,
      parserStatus: 'valid',
      normalizedDirectives: { value: 'SAMEORIGIN' },
    },
  },
  {
    id: 'obs-net-003',
    kind: 'request_attempt',
    collector: 'network',
    observedAt: '2026-09-22T12:00:00.600Z',
    data: {
      requestRef: 'req-02',
      origin: 'https://statistisk.analyse.example',
      method: 'GET',
      resourceType: 'script',
      relativeTimeMs: 600,
    },
  },
  {
    id: 'obs-net-004',
    kind: 'response_received',
    collector: 'network',
    observedAt: '2026-09-22T12:00:00.850Z',
    data: {
      requestRef: 'req-02',
      origin: 'https://statistisk.analyse.example',
      status: 200,
      relativeTimeMs: 850,
      mimeType: 'application/javascript',
    },
  },
  {
    id: 'obs-net-005',
    kind: 'request_attempt',
    collector: 'network',
    observedAt: '2026-09-22T12:00:00.900Z',
    data: {
      requestRef: 'req-03',
      origin: 'https://skrifttyper.cdn.example',
      method: 'GET',
      resourceType: 'font',
      relativeTimeMs: 900,
    },
  },
  {
    id: 'obs-net-006',
    kind: 'response_received',
    collector: 'network',
    observedAt: '2026-09-22T12:00:01.100Z',
    data: {
      requestRef: 'req-03',
      origin: 'https://skrifttyper.cdn.example',
      status: 200,
      relativeTimeMs: 1100,
      mimeType: 'font/woff2',
    },
  },
  {
    id: 'obs-cookie-001',
    kind: 'cookie_stored',
    collector: 'cookies',
    observedAt: '2026-09-22T12:00:01.200Z',
    data: {
      name: 'session_id',
      domain: 'skole.example',
      secure: true,
      httpOnly: true,
      sameSite: 'Lax',
      lifetimeCategory: 'session',
    },
  },
  {
    id: 'obs-cookie-002',
    kind: 'cookie_stored',
    collector: 'cookies',
    observedAt: '2026-09-22T12:00:01.210Z',
    data: {
      name: 'theme_valg',
      domain: 'skole.example',
      secure: true,
      httpOnly: false,
      sameSite: 'Strict',
      lifetimeCategory: 'persistent',
    },
  },
  {
    id: 'obs-store-001',
    kind: 'storage_summary',
    collector: 'storage',
    observedAt: '2026-09-22T12:00:01.300Z',
    data: {
      origin: 'https://skole.example',
      mechanism: 'localStorage',
      count: 2,
      accessible: true,
    },
  },
];

const successFindings = classifyObservations('https://skole.example', successObservations);

const successReportRaw: Omit<ScanReport, 'integrity'> = {
  schemaVersion: '1.0.0',
  scanProfileVersion: 'baseline-v1',
  engineVersion: '1.0.0',
  rulesetVersion: '1.0.0',
  redactionVersion: '1.0.0',
  datasetVersions: [],
  id: 'scan-demo-success',
  startedAt: '2026-09-22T12:00:00.000Z',
  finishedAt: '2026-09-22T2026-09-22T12:00:08.500Z'.replace('2026-09-22T2026-09-22T', '2026-09-22T'),
  expiresAt: '2026-09-22T13:00:00.000Z',
  status: 'completed',
  target: {
    requestedOrigin: 'https://skole.example',
    finalOrigin: 'https://skole.example',
  },
  environment: {
    browserVersion: 'Chromium 130.0.6723.69',
    region: 'eu-north-1',
    locale: 'da-DK',
    timezone: 'Europe/Copenhagen',
    viewport: { width: 1440, height: 900 },
  },
  collectors: {
    network: { status: 'complete', startedAt: '2026-09-22T12:00:00.050Z', finishedAt: '2026-09-22T12:00:08.000Z' },
    cookies: { status: 'complete', startedAt: '2026-09-22T12:00:08.010Z', finishedAt: '2026-09-22T12:00:08.100Z' },
    storage: { status: 'complete', startedAt: '2026-09-22T12:00:08.110Z', finishedAt: '2026-09-22T12:00:08.200Z' },
    headers: { status: 'complete', startedAt: '2026-09-22T12:00:00.350Z', finishedAt: '2026-09-22T12:00:00.390Z' },
    transport: { status: 'complete', startedAt: '2026-09-22T12:00:00.050Z', finishedAt: '2026-09-22T12:00:00.355Z' },
  },
  limitations: [
    'PASSIVE_BASELINE_NO_CLICK',
    'GET_HEAD_ONLY',
    'SINGLE_ORIGIN_VISIT',
    'NO_TRACKER_DATASET_LOADED',
  ],
  observations: successObservations,
  findings: successFindings,
  indicators: {
    'I-01': {
      value: 2,
      evidenceIds: ['obs-net-004', 'obs-net-006'],
      ruleVersion: '1.0.0',
    },
    'I-02': {
      value: 2,
      evidenceIds: ['obs-cookie-001', 'obs-cookie-002'],
      ruleVersion: '1.0.0',
    },
    'I-03': {
      value: null,
      reasonCode: 'DATASET_UNAVAILABLE',
      evidenceIds: [],
      ruleVersion: '1.0.0',
    },
    'I-04': {
      value: 100,
      evidenceIds: [
        'obs-trans-001',
        'obs-hdr-hsts',
        'obs-hdr-csp',
        'obs-hdr-ref',
        'obs-hdr-nosniff',
        'obs-hdr-xfo',
      ],
      ruleVersion: '1.0.0',
      details: {
        https: true,
        hsts: true,
        csp: true,
        referrerPolicy: true,
        nosniff: true,
        frameProtection: true,
      },
      passedChecksCount: 6,
      totalChecksCount: 6,
    },
  },
};

const successIntegrity = computeReportIntegrity(successReportRaw as unknown as Record<string, unknown>);
const successReport: ScanReport = {
  ...successReportRaw,
  integrity: successIntegrity,
};

// --- 2. PARTIAL FIXTURE ---
const partialObservations: Observation[] = [
  {
    id: 'obs-part-net-01',
    kind: 'request_attempt',
    collector: 'network',
    observedAt: '2026-09-22T12:00:00.100Z',
    data: {
      requestRef: 'req-p1',
      origin: 'https://avis.example',
      method: 'GET',
      resourceType: 'document',
      relativeTimeMs: 100,
    },
  },
  {
    id: 'obs-part-net-02',
    kind: 'response_received',
    collector: 'network',
    observedAt: '2026-09-22T12:00:00.400Z',
    data: {
      requestRef: 'req-p1',
      origin: 'https://avis.example',
      status: 200,
      relativeTimeMs: 400,
      mimeType: 'text/html',
    },
  },
  {
    id: 'obs-part-trans-01',
    kind: 'transport',
    collector: 'transport',
    observedAt: '2026-09-22T12:00:00.410Z',
    data: {
      finalScheme: 'https',
      tlsStatus: 'valid',
      downgraded: false,
    },
  },
  {
    id: 'obs-part-hdr-hsts',
    kind: 'header_check',
    collector: 'headers',
    observedAt: '2026-09-22T12:00:00.420Z',
    data: {
      headerName: 'Strict-Transport-Security',
      present: true,
      parserStatus: 'valid',
      normalizedDirectives: { 'max-age': 31536000 },
    },
  },
  {
    id: 'obs-part-cookie-01',
    kind: 'cookie_stored',
    collector: 'cookies',
    observedAt: '2026-09-22T12:00:00.500Z',
    data: {
      name: 'consent_mock',
      domain: 'avis.example',
      secure: true,
      httpOnly: false,
      sameSite: 'Lax',
      lifetimeCategory: 'persistent',
    },
  },
];

const partialFindings = classifyObservations('https://avis.example', partialObservations);

const partialReportRaw: Omit<ScanReport, 'integrity'> = {
  schemaVersion: '1.0.0',
  scanProfileVersion: 'baseline-v1',
  engineVersion: '1.0.0',
  rulesetVersion: '1.0.0',
  redactionVersion: '1.0.0',
  datasetVersions: [],
  id: 'scan-demo-partial',
  startedAt: '2026-09-22T12:00:00.000Z',
  finishedAt: '2026-09-22T12:00:30.000Z',
  expiresAt: '2026-09-22T13:00:00.000Z',
  status: 'partial',
  target: {
    requestedOrigin: 'https://avis.example',
    finalOrigin: 'https://avis.example',
  },
  environment: {
    browserVersion: 'Chromium 130.0.6723.69',
    region: 'eu-north-1',
    locale: 'da-DK',
    timezone: 'Europe/Copenhagen',
    viewport: { width: 1440, height: 900 },
  },
  collectors: {
    network: { status: 'partial', reasonCode: 'NAVIGATION_TIMEOUT', droppedCount: 14 },
    cookies: { status: 'complete' },
    storage: { status: 'complete' },
    headers: { status: 'partial', reasonCode: 'COLLECTOR_TIMEOUT' },
    transport: { status: 'complete' },
  },
  limitations: [
    'NAVIGATION_TIMEOUT',
    'RESOURCE_LIMIT',
    'COLLECTOR_PARTIAL',
  ],
  observations: partialObservations,
  findings: partialFindings,
  indicators: {
    'I-01': {
      value: null,
      reasonCode: 'NETWORK_PARTIAL',
      evidenceIds: [],
      ruleVersion: '1.0.0',
    },
    'I-02': {
      value: 1,
      evidenceIds: ['obs-part-cookie-01'],
      ruleVersion: '1.0.0',
    },
    'I-03': {
      value: null,
      reasonCode: 'I01_UNAVAILABLE',
      evidenceIds: [],
      ruleVersion: '1.0.0',
    },
    'I-04': {
      value: null,
      reasonCode: 'COLLECTORS_INCOMPLETE',
      evidenceIds: ['obs-part-trans-01', 'obs-part-hdr-hsts'],
      ruleVersion: '1.0.0',
      details: {
        https: true,
        hsts: true,
        csp: null,
        referrerPolicy: null,
        nosniff: null,
        frameProtection: null,
      },
      totalChecksCount: 6,
    },
  },
};

const partialIntegrity = computeReportIntegrity(partialReportRaw as unknown as Record<string, unknown>);
const partialReport: ScanReport = {
  ...partialReportRaw,
  integrity: partialIntegrity,
};

// --- 3. FAILED FIXTURE ---
const failedObservations: Observation[] = [
  {
    id: 'obs-fail-net-01',
    kind: 'request_attempt',
    collector: 'network',
    observedAt: '2026-09-22T12:00:00.100Z',
    data: {
      requestRef: 'req-f1',
      origin: 'https://lukket.example',
      method: 'GET',
      resourceType: 'document',
      relativeTimeMs: 100,
    },
  },
  {
    id: 'obs-fail-net-02',
    kind: 'request_blocked',
    collector: 'network',
    observedAt: '2026-09-22T12:00:15.100Z',
    data: {
      requestRef: 'req-f1',
      origin: 'https://lukket.example',
      method: 'GET',
      resourceType: 'document',
      relativeTimeMs: 15100,
      reasonCode: 'NAVIGATION_TIMEOUT',
    },
  },
];

const failedReportRaw: Omit<ScanReport, 'integrity'> = {
  schemaVersion: '1.0.0',
  scanProfileVersion: 'baseline-v1',
  engineVersion: '1.0.0',
  rulesetVersion: '1.0.0',
  redactionVersion: '1.0.0',
  datasetVersions: [],
  id: 'scan-demo-failed',
  startedAt: '2026-09-22T12:00:00.000Z',
  finishedAt: '2026-09-22T12:00:15.500Z',
  expiresAt: '2026-09-22T13:00:00.000Z',
  status: 'failed',
  target: {
    requestedOrigin: 'https://lukket.example',
    finalOrigin: 'https://lukket.example',
  },
  environment: {
    browserVersion: 'Chromium 130.0.6723.69',
    region: 'eu-north-1',
    locale: 'da-DK',
    timezone: 'Europe/Copenhagen',
    viewport: { width: 1440, height: 900 },
  },
  collectors: {
    network: { status: 'failed', reasonCode: 'NAVIGATION_TIMEOUT' },
    cookies: { status: 'not_run' },
    storage: { status: 'not_run' },
    headers: { status: 'not_run' },
    transport: { status: 'failed', reasonCode: 'TIMEOUT' },
  },
  limitations: ['NAVIGATION_TIMEOUT'],
  observations: failedObservations,
  findings: [],
  indicators: {
    'I-01': { value: null, reasonCode: 'NETWORK_FAILED', evidenceIds: [], ruleVersion: '1.0.0' },
    'I-02': { value: null, reasonCode: 'COOKIES_NOT_RUN', evidenceIds: [], ruleVersion: '1.0.0' },
    'I-03': { value: null, reasonCode: 'I01_UNAVAILABLE', evidenceIds: [], ruleVersion: '1.0.0' },
    'I-04': { value: null, reasonCode: 'COLLECTORS_INCOMPLETE', evidenceIds: [], ruleVersion: '1.0.0', totalChecksCount: 6 },
  },
  error: {
    code: 'NAVIGATION_TIMEOUT',
    messageKey: 'NAVIGATION_TIMEOUT',
    retryable: true,
    retryAfterSeconds: 30,
    supportRef: 'err-demo-91823',
  },
};

const failedIntegrity = computeReportIntegrity(failedReportRaw as unknown as Record<string, unknown>);
const failedReport: ScanReport = {
  ...failedReportRaw,
  integrity: failedIntegrity,
};

// Validate all three
for (const [name, report] of [
  ['success', successReport],
  ['partial', partialReport],
  ['failed', failedReport],
] as const) {
  // Schema validation
  ScanReportSchema.parse(report);
  // Semantic validation
  const errors = validateReportSemantics(report);
  if (errors.length > 0) {
    throw new Error(`Semantic errors in ${name} fixture: ${JSON.stringify(errors, null, 2)}`);
  }
}

// Write files
writeFileSync(resolve(__dirname, 'success.json'), JSON.stringify(successReport, null, 2), 'utf8');
writeFileSync(resolve(__dirname, 'partial.json'), JSON.stringify(partialReport, null, 2), 'utf8');
writeFileSync(resolve(__dirname, 'failed.json'), JSON.stringify(failedReport, null, 2), 'utf8');

console.log('Successfully generated and validated all 3 synthetic fixtures with RFC 8785 integrity digests.');
