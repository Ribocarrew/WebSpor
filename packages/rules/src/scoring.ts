import {
  Collectors,
  Observation,
  Indicators,
  TechnicalChecksDetail,
} from '@webspor/contracts';
import { isThirdParty, getRegisterableDomain } from './psl.js';

export const RULESET_VERSION = '1.0.0';

export interface ScoringInput {
  targetOrigin: string;
  finalOrigin: string;
  collectors: Collectors;
  observations: Observation[];
  datasetVersions?: Array<{ id: string; version: string }>;
  finalHttpStatus?: number;
  finalContentType?: string;
  isAccessWall?: boolean;
}

export interface ScoringOutput {
  indicators: Indicators;
  contactedThirdPartyDomains: string[];
}

const ALLOWED_REFERRER_POLICIES = new Set([
  'no-referrer',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
]);

/**
 * Deterministically compute I-01, I-02, I-03, I-04 indicators from observations and collector statuses.
 */
export function calculateIndicators(input: ScoringInput): ScoringOutput {
  const {
    finalOrigin,
    collectors,
    observations,
    datasetVersions = [],
    finalHttpStatus = 200,
    finalContentType = 'text/html',
    isAccessWall = false,
  } = input;

  // --- I-01: Kontaktede eksterne domæner ---
  const thirdPartyDomainsSet = new Set<string>();
  const i01EvidenceIds: string[] = [];

  for (const obs of observations) {
    if (obs.kind === 'response_received') {
      const candidateOrigin = obs.data.origin;
      if (isThirdParty(finalOrigin, candidateOrigin)) {
        try {
          const host = new URL(candidateOrigin).hostname;
          const regDomain = getRegisterableDomain(host);
          if (regDomain) {
            thirdPartyDomainsSet.add(regDomain);
            i01EvidenceIds.push(obs.id);
          }
        } catch {
          // ignore malformed origin
        }
      }
    }
  }

  const contactedThirdPartyDomains = Array.from(thirdPartyDomainsSet).sort();

  let i01Value: number | null = null;
  let i01Reason: string | undefined;

  if (collectors.network.status === 'complete') {
    i01Value = contactedThirdPartyDomains.length;
  } else {
    i01Reason = collectors.network.reasonCode || 'NETWORK_PARTIAL';
  }

  // --- I-02: Gemte cookies ---
  const storedCookieNames = new Set<string>();
  const i02EvidenceIds: string[] = [];

  for (const obs of observations) {
    if (obs.kind === 'cookie_stored') {
      storedCookieNames.add(`${obs.data.name}@${obs.data.domain}`);
      i02EvidenceIds.push(obs.id);
    }
  }

  let i02Value: number | null = null;
  let i02Reason: string | undefined;

  if (collectors.cookies.status === 'complete') {
    i02Value = storedCookieNames.size; // Complete with 0 cookies is 0, not null!
  } else {
    i02Reason = collectors.cookies.reasonCode || 'COOKIES_PARTIAL';
  }

  // --- I-03: Kildematch ---
  // In V1, if no active tracker dataset is loaded/reviewed, I-03 must be null (never fabricated 0!).
  let i03Value: number | null = null;
  let i03Reason: string | undefined;
  const i03EvidenceIds: string[] = [];

  const hasTrackerDataset = datasetVersions.some((d) => d.id.includes('tracker') || d.id.includes('disconnect'));
  if (i01Value === null) {
    i03Reason = 'I01_UNAVAILABLE';
  } else if (!hasTrackerDataset) {
    i03Reason = 'DATASET_UNAVAILABLE'; // Per ADR-009: without reviewed dataset, indicator is null
  } else {
    // If a dataset were present, match would be performed here.
    i03Value = 0;
  }

  // --- I-04: Observerede tekniske beskyttelsessignaler ---
  let i04Value: number | null = null;
  let i04Reason: string | undefined;
  const i04EvidenceIds: string[] = [];

  const checks: TechnicalChecksDetail = {
    https: null,
    hsts: null,
    csp: null,
    referrerPolicy: null,
    nosniff: null,
    frameProtection: null,
  };

  const headersComplete = collectors.headers.status === 'complete';
  const transportComplete = collectors.transport.status === 'complete';

  // Find transport observation
  const transportObs = observations.find((o) => o.kind === 'transport');
  if (transportObs && transportObs.kind === 'transport') {
    i04EvidenceIds.push(transportObs.id);
    const { finalScheme, tlsStatus, downgraded } = transportObs.data;
    if (tlsStatus === 'valid' && finalScheme === 'https' && !downgraded) {
      checks.https = true;
    } else if (tlsStatus === 'none' || finalScheme === 'http' || downgraded) {
      checks.https = false;
    } else {
      checks.https = null;
    }
  } else if (transportComplete) {
    checks.https = false;
  }

  // Header observations
  const headerChecks = observations.filter(
    (o): o is Extract<Observation, { kind: 'header_check' }> => o.kind === 'header_check'
  );

  let hasCspFrameAncestors: boolean | null = null;
  let hasXfo: boolean | null = null;

  for (const h of headerChecks) {
    i04EvidenceIds.push(h.id);
    const name = h.data.headerName.toLowerCase();
    const directives = h.data.normalizedDirectives;

    if (name === 'strict-transport-security') {
      if (h.data.present && h.data.parserStatus === 'valid') {
        const maxAge = directives['max-age'];
        checks.hsts = typeof maxAge === 'number' && maxAge > 0;
      } else if (h.data.present && h.data.parserStatus === 'invalid') {
        checks.hsts = false;
      } else if (!h.data.present && headersComplete) {
        checks.hsts = false;
      }
    } else if (name === 'content-security-policy') {
      if (h.data.present && h.data.parserStatus === 'valid') {
        checks.csp = true;
        // Check frame-ancestors
        if (directives['frame-ancestors']) {
          const val = String(directives['frame-ancestors']);
          hasCspFrameAncestors = !val.includes('*');
        }
      } else if (h.data.present && h.data.parserStatus === 'invalid') {
        checks.csp = false;
      } else if (!h.data.present && headersComplete) {
        checks.csp = false;
      }
    } else if (name === 'referrer-policy') {
      if (h.data.present && h.data.parserStatus === 'valid') {
        const policy = String(directives['policy'] || '').toLowerCase();
        checks.referrerPolicy = ALLOWED_REFERRER_POLICIES.has(policy);
      } else if (h.data.present && h.data.parserStatus === 'invalid') {
        checks.referrerPolicy = false;
      } else if (!h.data.present && headersComplete) {
        checks.referrerPolicy = false;
      }
    } else if (name === 'x-content-type-options') {
      if (h.data.present && h.data.parserStatus === 'valid') {
        checks.nosniff = directives['value'] === 'nosniff';
      } else if (h.data.present && h.data.parserStatus === 'invalid') {
        checks.nosniff = false;
      } else if (!h.data.present && headersComplete) {
        checks.nosniff = false;
      }
    } else if (name === 'x-frame-options') {
      if (h.data.present && h.data.parserStatus === 'valid') {
        const xfo = String(directives['value'] || '').toUpperCase();
        hasXfo = xfo === 'DENY' || xfo === 'SAMEORIGIN';
      } else if (h.data.present && h.data.parserStatus === 'invalid') {
        hasXfo = false;
      } else if (!h.data.present && headersComplete) {
        hasXfo = false;
      }
    }
  }

  // Frame protection logic: CSP frame-ancestors takes precedence over XFO
  if (hasCspFrameAncestors !== null) {
    checks.frameProtection = hasCspFrameAncestors;
  } else if (hasXfo !== null) {
    checks.frameProtection = hasXfo;
  } else if (headersComplete) {
    checks.frameProtection = false;
  }

  // Check preconditions for I-04:
  // Must have 2xx HTML response, not access wall, and headers + transport collectors complete.
  const is2xxHtml = finalHttpStatus >= 200 && finalHttpStatus < 300 && finalContentType.includes('text/html');

  let passedChecksCount = 0;
  const allChecksList = [
    checks.https,
    checks.hsts,
    checks.csp,
    checks.referrerPolicy,
    checks.nosniff,
    checks.frameProtection,
  ];

  const anyUnknown = allChecksList.some((c) => c === null);

  if (!headersComplete || !transportComplete) {
    i04Reason = 'COLLECTORS_INCOMPLETE';
  } else if (!is2xxHtml) {
    i04Reason = 'NON_HTML_OR_HTTP_ERROR';
  } else if (isAccessWall) {
    i04Reason = 'ACCESS_WALL_DETECTED';
  } else if (anyUnknown) {
    i04Reason = 'CHECK_UNASSESSABLE'; // If any check is unknown, suppress score (null) per scoring.md
  } else {
    passedChecksCount = allChecksList.filter((c) => c === true).length;
    i04Value = Math.round((100 * passedChecksCount) / 6);
  }

  return {
    indicators: {
      'I-01': {
        value: i01Value,
        reasonCode: i01Reason,
        evidenceIds: Array.from(new Set(i01EvidenceIds)),
        ruleVersion: RULESET_VERSION,
      },
      'I-02': {
        value: i02Value,
        reasonCode: i02Reason,
        evidenceIds: Array.from(new Set(i02EvidenceIds)),
        ruleVersion: RULESET_VERSION,
      },
      'I-03': {
        value: i03Value,
        reasonCode: i03Reason,
        evidenceIds: Array.from(new Set(i03EvidenceIds)),
        ruleVersion: RULESET_VERSION,
      },
      'I-04': {
        value: i04Value,
        reasonCode: i04Reason,
        evidenceIds: Array.from(new Set(i04EvidenceIds)),
        ruleVersion: RULESET_VERSION,
        details: checks,
        passedChecksCount: anyUnknown ? undefined : passedChecksCount,
        totalChecksCount: 6,
      },
    },
    contactedThirdPartyDomains,
  };
}
