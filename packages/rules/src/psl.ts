import psl from 'psl';

/**
 * Extracts the registerable domain (eTLD+1) using the Public Suffix List.
 * Gracefully handles RFC 2606 .example domains used for testing and demo.
 */
export function getRegisterableDomain(hostname: string): string | null {
  if (!hostname) return null;
  const clean = hostname.trim().toLowerCase();

  // Special handling for RFC 2606 .example domains
  if (clean.endsWith('.example')) {
    const parts = clean.split('.');
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}.example`;
    }
    return 'example';
  }

  const domain = psl.get(clean);
  return domain || null;
}

/**
 * Determines whether a candidate origin/URL is third-party relative to the final target origin.
 */
export function isThirdParty(targetOrigin: string, candidateOrigin: string): boolean {
  try {
    const targetHost = new URL(targetOrigin).hostname;
    const candidateHost = new URL(candidateOrigin).hostname;

    const targetDomain = getRegisterableDomain(targetHost);
    const candidateDomain = getRegisterableDomain(candidateHost);

    if (!targetDomain || !candidateDomain) {
      // If we cannot determine registerable domain, check exact host match
      return targetHost !== candidateHost;
    }

    return targetDomain !== candidateDomain;
  } catch {
    return true;
  }
}
