import { createHash } from 'node:crypto';

/**
 * RFC 8785 JSON Canonicalization Scheme (JCS)
 * Sorts object keys recursively, removes whitespace, serializes numbers/booleans/strings deterministically.
 */
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const serializedItems = obj.map((item) => canonicalizeJson(item));
    return `[${serializedItems.join(',')}]`;
  }

  const entries = Object.entries(obj as Record<string, unknown>)
    .filter(([_, v]) => v !== undefined)
    .sort(([keyA], [keyB]) => (keyA < keyB ? -1 : keyA > keyB ? 1 : 0));

  const serializedProps = entries.map(
    ([k, v]) => `${JSON.stringify(k)}:${canonicalizeJson(v)}`
  );

  return `{${serializedProps.join(',')}}`;
}

/**
 * Compute SHA-256 digest of RFC 8785 canonicalized JSON.
 */
export function computeIntegrityDigest(data: unknown): string {
  const canonicalString = canonicalizeJson(data);
  return createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Compute integrity digest for a report, excluding the `integrity` field itself.
 */
export function computeReportIntegrity(report: Record<string, unknown>): {
  algorithm: 'SHA-256';
  canonicalization: 'RFC8785';
  digest: string;
} {
  const { integrity: _, ...reportWithoutIntegrity } = report;
  const digest = computeIntegrityDigest(reportWithoutIntegrity);
  return {
    algorithm: 'SHA-256',
    canonicalization: 'RFC8785',
    digest,
  };
}

/**
 * Verify integrity of a report against its declared digest.
 */
export function verifyReportIntegrity(report: { integrity?: { digest: string }; [key: string]: unknown }): boolean {
  if (!report.integrity || !report.integrity.digest) return false;
  const expected = computeReportIntegrity(report as Record<string, unknown>);
  return expected.digest.toLowerCase() === report.integrity.digest.toLowerCase();
}
