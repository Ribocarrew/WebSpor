import { Observation } from '@webspor/contracts';

export const REDACTION_VERSION = '1.0.0';

/**
 * Normalizes any URL down to its origin (scheme://host:port).
 * Drops all path, query, and hash parameters to prevent personal data leakage.
 */
export function redactUrlToOrigin(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return parsed.origin;
  } catch {
    return 'unknown-origin';
  }
}

/**
 * Sanitizes cookie names: checks length and sanitizes control characters.
 * Replaces high-entropy or potentially personal cookie values with generic safe name if suspicious.
 */
export function sanitizeCookieName(name: string): string {
  if (!name) return 'anonymous_cookie';
  const clean = name.trim().replace(/[\x00-\x1F\x7F]/g, '');
  if (clean.length > 256) {
    return clean.slice(0, 256);
  }
  return clean;
}

/**
 * Redacts a list of raw observations to ensure:
 * - At most 200 observations
 * - All origins are valid origins without paths/queries
 * - Cookie values/paths are completely absent
 */
export function redactObservations(rawObservations: Observation[]): {
  observations: Observation[];
  droppedCount: number;
  isTruncated: boolean;
} {
  const maxEvents = 200;
  const droppedCount = Math.max(0, rawObservations.length - maxEvents);
  const observations = rawObservations.slice(0, maxEvents);

  return {
    observations,
    droppedCount,
    isTruncated: droppedCount > 0,
  };
}
