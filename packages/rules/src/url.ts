export interface UrlValidationResult {
  valid: boolean;
  errorCode?: string;
  errorMessage?: string;
  canonicalUrl?: string; // Always ASCII https://example.com/ or http://example.com/
  displayUrl?: string;   // Unicode safe display version
  origin?: string;       // Origin without path
  hostname?: string;     // ASCII hostname
}

const SPECIAL_USE_DOMAINS = [
  'localhost',
  'local',
  'internal',
  'lan',
  'home.arpa',
  'invalid',
  'test',
  'corp',
  'onion',
  'i2p',
];

/**
 * Checks if a string looks like an IPv4 address (decimal, octal, hex, or dword).
 */
function isNumericIp(str: string): boolean {
  const clean = str.trim();

  // IPv6 bracketed
  if (clean.startsWith('[') || clean.endsWith(']')) {
    return true;
  }

  // IPv4 dotted format (decimal, hex, octal)
  const parts = clean.split('.');
  if (parts.length === 4) {
    const allNumeric = parts.every((p) => {
      if (/^0x[0-9a-f]+$/i.test(p)) return true; // hex
      if (/^0[0-7]+$/.test(p)) return true; // octal
      if (/^\d+$/.test(p)) return true; // decimal
      return false;
    });
    if (allNumeric) return true;
  }

  // Single integer (DWORD IP format, e.g. 2130706433)
  if (/^\d{7,10}$/.test(clean)) {
    return true;
  }

  // Check if string contains colons (IPv6)
  if (clean.includes(':')) {
    return true;
  }

  return false;
}

/**
 * Validates and normalizes target URL according to S-01 specification.
 * @param input Raw user-supplied string
 * @param allowExampleTld Whether .example TLD is permitted (e.g. for synthetic fixtures/tests)
 */
export function validateAndNormalizeTargetUrl(
  input: string,
  allowExampleTld = false
): UrlValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      errorCode: 'INVALID_TARGET',
      errorMessage: 'Angiv venligst en webadresse.',
    };
  }

  const trimmed = input.trim();

  if (trimmed.length > 2048) {
    return {
      valid: false,
      errorCode: 'INVALID_TARGET',
      errorMessage: 'Webadressen må højst være 2048 tegn.',
    };
  }

  // S-01: Reject control characters and backslashes
  if (/[\x00-\x1F\x7F\\]/.test(trimmed)) {
    return {
      valid: false,
      errorCode: 'INVALID_TARGET',
      errorMessage: 'Webadressen indeholder ugyldige tegn eller skråstreger (\\).',
    };
  }

  // S-01: Reject query and fragment in user input
  if (trimmed.includes('?')) {
    return {
      valid: false,
      errorCode: 'INVALID_TARGET',
      errorMessage: 'Undersøgelsen tillader ikke URL-parametre (query string ?). Indtast et rent domænenavn eller sti.',
    };
  }

  if (trimmed.includes('#')) {
    return {
      valid: false,
      errorCode: 'INVALID_TARGET',
      errorMessage: 'Webadressen må ikke indeholde URL-fragment (#).',
    };
  }

  // S-01: Reject credentials (user:pass@)
  if (trimmed.includes('@')) {
    return {
      valid: false,
      errorCode: 'INVALID_TARGET',
      errorMessage: 'Webadressen må ikke indeholde loginoplysninger (brugernavn/adgangskode).',
    };
  }

  // S-01: If bare domain (no scheme), default to https://
  let normalizedInput = trimmed;
  if (!/^https?:\/\//i.test(normalizedInput)) {
    // Check if other scheme was given (e.g. ftp://, javascript:)
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalizedInput)) {
      return {
        valid: false,
        errorCode: 'INVALID_TARGET',
        errorMessage: 'Kun HTTP og HTTPS er understøttet.',
      };
    }
    normalizedInput = `https://${normalizedInput}`;
  }

  // Parse URL
  let parsed: URL;
  try {
    parsed = new URL(normalizedInput);
  } catch {
    return {
      valid: false,
      errorCode: 'INVALID_TARGET',
      errorMessage: 'Webadressen kunne ikke parses som en gyldig URL.',
    };
  }

  // S-01: Scheme check
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      errorCode: 'INVALID_TARGET',
      errorMessage: 'Kun HTTP og HTTPS protokoller er tilladt.',
    };
  }

  // S-01: Port check (only 80 and 443 allowed)
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    return {
      valid: false,
      errorCode: 'TARGET_DISALLOWED',
      errorMessage: `Port ${parsed.port} er ikke tilladt. Kun standardportene 80 og 443 understøttes.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // S-01: Reject IP literals
  if (isNumericIp(hostname)) {
    return {
      valid: false,
      errorCode: 'TARGET_DISALLOWED',
      errorMessage: 'Scanning af direkte IP-adresser er ikke tilladt af sikkerhedshensyn.',
    };
  }

  // S-01: Special-use hostnames
  const domainParts = hostname.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (SPECIAL_USE_DOMAINS.includes(hostname) || SPECIAL_USE_DOMAINS.includes(tld)) {
    return {
      valid: false,
      errorCode: 'TARGET_DISALLOWED',
      errorMessage: `Special-use domæner som .${tld} kan ikke scannes.`,
    };
  }

  if (tld === 'example' && !allowExampleTld) {
    return {
      valid: false,
      errorCode: 'TARGET_DISALLOWED',
      errorMessage: '.example domæner er forbeholdt syntetiske tests og demo.',
    };
  }

  // Check cloud metadata hosts
  if (hostname === 'metadata.google.internal' || hostname.includes('169.254')) {
    return {
      valid: false,
      errorCode: 'TARGET_DISALLOWED',
      errorMessage: 'Adgang til sky-metadata er blokeret.',
    };
  }

  // Ensure hostname has at least a domain name and TLD (or is single label that is not allowed)
  if (domainParts.length < 2 || domainParts.some((p) => p.length === 0)) {
    return {
      valid: false,
      errorCode: 'INVALID_TARGET',
      errorMessage: 'Indtast venligst et fuldstændigt domænenavn med endelse (f.eks. .dk eller .org).',
    };
  }

  const canonicalUrl = parsed.toString();
  const origin = parsed.origin;

  // Safe unicode display representation
  let displayUrl = canonicalUrl;
  try {
    displayUrl = decodeURI(canonicalUrl);
  } catch {
    displayUrl = canonicalUrl;
  }

  return {
    valid: true,
    canonicalUrl,
    displayUrl,
    origin,
    hostname,
  };
}
