import { describe, it, expect } from 'vitest';
import { calculateIndicators } from '@webspor/rules';
import { Collectors, Observation } from '@webspor/contracts';

describe('T-07: Indicator scoring and deterministic rules', () => {
  const baseCollectors: Collectors = {
    network: { status: 'complete' },
    cookies: { status: 'complete' },
    storage: { status: 'complete' },
    headers: { status: 'complete' },
    transport: { status: 'complete' },
  };

  it('calculates 67 for 4 out of 6 passing checks', () => {
    const observations: Observation[] = [
      {
        id: 't1',
        kind: 'transport',
        collector: 'transport',
        observedAt: '2026-09-22T12:00:00Z',
        data: { finalScheme: 'https', tlsStatus: 'valid', downgraded: false }, // Check 1: PASS
      },
      {
        id: 'h1',
        kind: 'header_check',
        collector: 'headers',
        observedAt: '2026-09-22T12:00:00Z',
        data: { headerName: 'Strict-Transport-Security', present: true, parserStatus: 'valid', normalizedDirectives: { 'max-age': 3600 } }, // Check 2: PASS
      },
      {
        id: 'h2',
        kind: 'header_check',
        collector: 'headers',
        observedAt: '2026-09-22T12:00:00Z',
        data: { headerName: 'Content-Security-Policy', present: false, parserStatus: 'missing', normalizedDirectives: {} }, // Check 3: FAIL
      },
      {
        id: 'h3',
        kind: 'header_check',
        collector: 'headers',
        observedAt: '2026-09-22T12:00:00Z',
        data: { headerName: 'Referrer-Policy', present: true, parserStatus: 'valid', normalizedDirectives: { policy: 'same-origin' } }, // Check 4: PASS
      },
      {
        id: 'h4',
        kind: 'header_check',
        collector: 'headers',
        observedAt: '2026-09-22T12:00:00Z',
        data: { headerName: 'X-Content-Type-Options', present: true, parserStatus: 'valid', normalizedDirectives: { value: 'nosniff' } }, // Check 5: PASS
      },
      {
        id: 'h5',
        kind: 'header_check',
        collector: 'headers',
        observedAt: '2026-09-22T12:00:00Z',
        data: { headerName: 'X-Frame-Options', present: false, parserStatus: 'missing', normalizedDirectives: {} }, // Check 6: FAIL
      },
    ];

    const result = calculateIndicators({
      targetOrigin: 'https://skole.example',
      finalOrigin: 'https://skole.example',
      collectors: baseCollectors,
      observations,
      finalHttpStatus: 200,
      finalContentType: 'text/html; charset=utf-8',
    });

    expect(result.indicators['I-04'].value).toBe(67);
    expect(result.indicators['I-04'].passedChecksCount).toBe(4);
    expect(result.indicators['I-04'].totalChecksCount).toBe(6);
  });

  it('suppresses I-04 score to null if any check is unknown', () => {
    const observations: Observation[] = [
      {
        id: 't1',
        kind: 'transport',
        collector: 'transport',
        observedAt: '2026-09-22T12:00:00Z',
        data: { finalScheme: 'https', tlsStatus: 'valid', downgraded: false }, // PASS
      },
      {
        id: 'h1',
        kind: 'header_check',
        collector: 'headers',
        observedAt: '2026-09-22T12:00:00Z',
        data: { headerName: 'Strict-Transport-Security', present: true, parserStatus: 'unparseable', normalizedDirectives: {} }, // UNKNOWN
      },
    ];

    const result = calculateIndicators({
      targetOrigin: 'https://skole.example',
      finalOrigin: 'https://skole.example',
      collectors: baseCollectors,
      observations,
    });

    expect(result.indicators['I-04'].value).toBeNull();
    expect(result.indicators['I-04'].reasonCode).toBe('CHECK_UNASSESSABLE');
  });

  it('evaluates complete cookies with 0 stored cookies as 0, not null', () => {
    const result = calculateIndicators({
      targetOrigin: 'https://skole.example',
      finalOrigin: 'https://skole.example',
      collectors: baseCollectors,
      observations: [],
    });

    expect(result.indicators['I-02'].value).toBe(0);
  });

  it('sets I-02 to null if cookie collector is partial', () => {
    const partialCollectors = {
      ...baseCollectors,
      cookies: { status: 'partial' as const, reasonCode: 'COOKIES_TIMEOUT' },
    };

    const result = calculateIndicators({
      targetOrigin: 'https://skole.example',
      finalOrigin: 'https://skole.example',
      collectors: partialCollectors,
      observations: [],
    });

    expect(result.indicators['I-02'].value).toBeNull();
    expect(result.indicators['I-02'].reasonCode).toBe('COOKIES_TIMEOUT');
  });

  it('sets I-03 to null when no tracker dataset is loaded', () => {
    const result = calculateIndicators({
      targetOrigin: 'https://skole.example',
      finalOrigin: 'https://skole.example',
      collectors: baseCollectors,
      observations: [],
      datasetVersions: [],
    });

    expect(result.indicators['I-03'].value).toBeNull();
    expect(result.indicators['I-03'].reasonCode).toBe('DATASET_UNAVAILABLE');
  });
});
