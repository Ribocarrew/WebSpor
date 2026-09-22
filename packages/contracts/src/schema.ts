import { z } from 'zod';

export const CollectorStatusSchema = z.enum(['complete', 'partial', 'failed', 'not_run']);
export type CollectorStatus = z.infer<typeof CollectorStatusSchema>;

export const CollectorSummarySchema = z.object({
  status: CollectorStatusSchema,
  reasonCode: z.string().max(100).optional(),
  droppedCount: z.number().int().nonnegative().optional(),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
}).strict();
export type CollectorSummary = z.infer<typeof CollectorSummarySchema>;

export const CollectorsSchema = z.object({
  network: CollectorSummarySchema,
  cookies: CollectorSummarySchema,
  storage: CollectorSummarySchema,
  headers: CollectorSummarySchema,
  transport: CollectorSummarySchema,
}).strict();
export type Collectors = z.infer<typeof CollectorsSchema>;

export const TargetSummarySchema = z.object({
  requestedOrigin: z.string().url().max(2048),
  finalOrigin: z.string().url().max(2048),
}).strict();
export type TargetSummary = z.infer<typeof TargetSummarySchema>;

export const EnvironmentSummarySchema = z.object({
  browserVersion: z.string().max(200),
  region: z.string().max(100),
  locale: z.string().max(20),
  timezone: z.string().max(100),
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }).strict(),
}).strict();
export type EnvironmentSummary = z.infer<typeof EnvironmentSummarySchema>;

export const DatasetVersionSchema = z.object({
  id: z.string().max(100),
  version: z.string().max(100),
  license: z.string().max(100),
  reviewedAt: z.string().datetime(),
}).strict();
export type DatasetVersion = z.infer<typeof DatasetVersionSchema>;

// Observation kinds
export const RequestAttemptDataSchema = z.object({
  requestRef: z.string().max(100),
  origin: z.string().url().max(2048),
  method: z.enum(['GET', 'HEAD']),
  resourceType: z.string().max(50),
  relativeTimeMs: z.number().nonnegative(),
}).strict();

export const RequestBlockedDataSchema = z.object({
  requestRef: z.string().max(100),
  origin: z.string().url().max(2048),
  method: z.string().max(20),
  resourceType: z.string().max(50),
  relativeTimeMs: z.number().nonnegative(),
  reasonCode: z.string().max(100),
}).strict();

export const ResponseReceivedDataSchema = z.object({
  requestRef: z.string().max(100),
  origin: z.string().url().max(2048),
  status: z.number().int().min(100).max(599),
  relativeTimeMs: z.number().nonnegative(),
  mimeType: z.string().max(100).optional(),
}).strict();

export const CookieStoredDataSchema = z.object({
  name: z.string().max(256),
  domain: z.string().max(256),
  secure: z.boolean(),
  httpOnly: z.boolean(),
  sameSite: z.enum(['Strict', 'Lax', 'None', 'unspecified']),
  lifetimeCategory: z.enum(['session', 'persistent']),
}).strict();

export const CookieSetAttemptDataSchema = z.object({
  name: z.string().max(256),
  domain: z.string().max(256).optional(),
  secure: z.boolean().optional(),
  httpOnly: z.boolean().optional(),
  sameSite: z.string().max(50).optional(),
}).strict();

export const StorageSummaryDataSchema = z.object({
  origin: z.string().url().max(2048),
  mechanism: z.enum(['localStorage', 'sessionStorage', 'indexedDB']),
  count: z.number().int().nonnegative(),
  accessible: z.boolean(),
}).strict();

export const HeaderCheckDataSchema = z.object({
  headerName: z.string().max(100),
  present: z.boolean(),
  parserStatus: z.enum(['valid', 'invalid', 'unparseable', 'missing']),
  normalizedDirectives: z.record(z.union([z.string(), z.boolean(), z.number()])),
}).strict();

export const TransportDataSchema = z.object({
  finalScheme: z.enum(['https', 'http']),
  tlsStatus: z.enum(['valid', 'invalid', 'none']),
  downgraded: z.boolean(),
  certDetailsRedacted: z.boolean().optional(),
}).strict();

export const ObservationSchema = z.discriminatedUnion('kind', [
  z.object({
    id: z.string().max(100),
    kind: z.literal('request_attempt'),
    collector: z.literal('network'),
    observedAt: z.string().datetime(),
    data: RequestAttemptDataSchema,
  }).strict(),
  z.object({
    id: z.string().max(100),
    kind: z.literal('request_blocked'),
    collector: z.literal('network'),
    observedAt: z.string().datetime(),
    data: RequestBlockedDataSchema,
  }).strict(),
  z.object({
    id: z.string().max(100),
    kind: z.literal('response_received'),
    collector: z.literal('network'),
    observedAt: z.string().datetime(),
    data: ResponseReceivedDataSchema,
  }).strict(),
  z.object({
    id: z.string().max(100),
    kind: z.literal('cookie_stored'),
    collector: z.literal('cookies'),
    observedAt: z.string().datetime(),
    data: CookieStoredDataSchema,
  }).strict(),
  z.object({
    id: z.string().max(100),
    kind: z.literal('cookie_set_attempt'),
    collector: z.literal('cookies'),
    observedAt: z.string().datetime(),
    data: CookieSetAttemptDataSchema,
  }).strict(),
  z.object({
    id: z.string().max(100),
    kind: z.literal('storage_summary'),
    collector: z.literal('storage'),
    observedAt: z.string().datetime(),
    data: StorageSummaryDataSchema,
  }).strict(),
  z.object({
    id: z.string().max(100),
    kind: z.literal('header_check'),
    collector: z.literal('headers'),
    observedAt: z.string().datetime(),
    data: HeaderCheckDataSchema,
  }).strict(),
  z.object({
    id: z.string().max(100),
    kind: z.literal('transport'),
    collector: z.literal('transport'),
    observedAt: z.string().datetime(),
    data: TransportDataSchema,
  }).strict(),
]);
export type Observation = z.infer<typeof ObservationSchema>;

export const SourceRefSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(200),
  version: z.string().max(100),
  url: z.string().url().max(2048).optional(),
}).strict();
export type SourceRef = z.infer<typeof SourceRefSchema>;

export const EpistemicStatusSchema = z.enum(['observed', 'matched', 'inferred', 'unknown']);
export type EpistemicStatus = z.infer<typeof EpistemicStatusSchema>;

export const FindingCategorySchema = z.enum(['network', 'cookies', 'headers', 'transport', 'storage']);
export type FindingCategory = z.infer<typeof FindingCategorySchema>;

export const FindingSchema = z.object({
  id: z.string().max(100),
  ruleId: z.string().max(100),
  ruleVersion: z.string().max(100),
  category: FindingCategorySchema,
  epistemicStatus: EpistemicStatusSchema,
  evidenceIds: z.array(z.string().max(100)).min(1),
  sourceRefs: z.array(SourceRefSchema),
  explanationKey: z.string().max(100),
  limitations: z.array(z.string().max(100)),
  title: z.string().max(300),
  description: z.string().max(1000).optional(),
  data: z.record(z.unknown()).optional(),
}).strict();
export type Finding = z.infer<typeof FindingSchema>;

export const BaseIndicatorSchema = z.object({
  value: z.number().int().min(0).max(100).nullable(),
  reasonCode: z.string().max(100).optional(),
  evidenceIds: z.array(z.string().max(100)),
  ruleVersion: z.string().max(100),
}).strict();

export const TechnicalChecksDetailSchema = z.object({
  https: z.boolean().nullable(),
  hsts: z.boolean().nullable(),
  csp: z.boolean().nullable(),
  referrerPolicy: z.boolean().nullable(),
  nosniff: z.boolean().nullable(),
  frameProtection: z.boolean().nullable(),
}).strict();
export type TechnicalChecksDetail = z.infer<typeof TechnicalChecksDetailSchema>;

export const IndicatorI04Schema = z.object({
  value: z.number().int().min(0).max(100).nullable(),
  reasonCode: z.string().max(100).optional(),
  evidenceIds: z.array(z.string().max(100)),
  ruleVersion: z.string().max(100),
  details: TechnicalChecksDetailSchema.optional(),
  passedChecksCount: z.number().int().min(0).max(6).optional(),
  totalChecksCount: z.literal(6).default(6),
}).strict();

export const IndicatorsSchema = z.object({
  'I-01': BaseIndicatorSchema,
  'I-02': BaseIndicatorSchema,
  'I-03': BaseIndicatorSchema,
  'I-04': IndicatorI04Schema,
}).strict();
export type Indicators = z.infer<typeof IndicatorsSchema>;

export const IntegritySchema = z.object({
  algorithm: z.literal('SHA-256'),
  canonicalization: z.literal('RFC8785'),
  digest: z.string().regex(/^[0-9a-f]{64}$/i),
}).strict();
export type Integrity = z.infer<typeof IntegritySchema>;

export const ErrorPayloadSchema = z.object({
  code: z.string().max(100),
  messageKey: z.string().max(100),
  retryable: z.boolean(),
  retryAfterSeconds: z.number().int().positive().optional(),
  supportRef: z.string().max(100),
}).strict();
export type ErrorPayload = z.infer<typeof ErrorPayloadSchema>;

export const ScanReportSchema = z.object({
  schemaVersion: z.string().max(20),
  scanProfileVersion: z.string().max(50),
  engineVersion: z.string().max(50),
  rulesetVersion: z.string().max(50),
  redactionVersion: z.string().max(50),
  datasetVersions: z.array(DatasetVersionSchema),
  id: z.string().max(100),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  status: z.enum(['completed', 'partial', 'failed', 'cancelled']),
  target: TargetSummarySchema,
  environment: EnvironmentSummarySchema,
  collectors: CollectorsSchema,
  limitations: z.array(z.string().max(100)),
  observations: z.array(ObservationSchema).max(200),
  findings: z.array(FindingSchema),
  indicators: IndicatorsSchema,
  integrity: IntegritySchema,
  error: ErrorPayloadSchema.optional(),
}).strict();
export type ScanReport = z.infer<typeof ScanReportSchema>;

// API request & response schemas
export const ApiScanCreateRequestSchema = z.object({
  url: z.string().url().max(2048),
  profile: z.literal('baseline-v1').default('baseline-v1'),
}).strict();
export type ApiScanCreateRequest = z.infer<typeof ApiScanCreateRequestSchema>;

export const ApiScanCreateResponseSchema = z.object({
  id: z.string().max(100),
  accessToken: z.string().max(256),
  status: z.literal('queued'),
  expiresAt: z.string().datetime(),
  pollAfterSeconds: z.literal(2),
}).strict();
export type ApiScanCreateResponse = z.infer<typeof ApiScanCreateResponseSchema>;

export const ScanStatusEnum = z.enum([
  'queued',
  'validating',
  'running',
  'processing',
  'completed',
  'partial',
  'failed',
  'cancelled',
]);
export type ScanStatus = z.infer<typeof ScanStatusEnum>;

export const ApiScanStatusResponseSchema = z.object({
  id: z.string().max(100),
  status: ScanStatusEnum,
  expiresAt: z.string().datetime(),
  pollAfterSeconds: z.number().int().positive().optional(),
  report: ScanReportSchema.optional(),
  error: ErrorPayloadSchema.optional(),
}).strict();
export type ApiScanStatusResponse = z.infer<typeof ApiScanStatusResponseSchema>;
