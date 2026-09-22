import { describe, it, expect } from 'vitest';
import { validateAndNormalizeTargetUrl } from '@webspor/rules';

describe('T-01: URL validation and admission (S-01)', () => {
  it('normalizes a bare domain to https:// with trailing slash', () => {
    const res = validateAndNormalizeTargetUrl('dr.dk');
    expect(res.valid).toBe(true);
    expect(res.canonicalUrl).toBe('https://dr.dk/');
    expect(res.origin).toBe('https://dr.dk');
    expect(res.hostname).toBe('dr.dk');
  });

  it('accepts explicit http:// URL on standard port 80', () => {
    const res = validateAndNormalizeTargetUrl('http://example.org:80/');
    expect(res.valid).toBe(true);
    expect(res.canonicalUrl).toBe('http://example.org/');
  });

  it('rejects credentials in URL (user:pass@host)', () => {
    const res = validateAndNormalizeTargetUrl('https://admin:secret@example.com/');
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('INVALID_TARGET');
  });

  it('rejects query parameters in user input (?foo=bar)', () => {
    const res = validateAndNormalizeTargetUrl('https://example.com/?tracker=123');
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('INVALID_TARGET');
  });

  it('rejects URL fragments in user input (#section)', () => {
    const res = validateAndNormalizeTargetUrl('https://example.com/#main');
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('INVALID_TARGET');
  });

  it('rejects backslashes in URL input', () => {
    const res = validateAndNormalizeTargetUrl('https://example.com\\malicious');
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('INVALID_TARGET');
  });

  it('rejects non-HTTP/HTTPS protocols', () => {
    expect(validateAndNormalizeTargetUrl('ftp://ftp.example.com').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('javascript:alert(1)').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('file:///etc/passwd').valid).toBe(false);
  });

  it('rejects non-standard ports (e.g. 8080, 3000, 22)', () => {
    const res = validateAndNormalizeTargetUrl('https://example.com:8080/');
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('TARGET_DISALLOWED');
  });

  it('rejects IPv4 literals (dotted decimal, octal, hex, dword)', () => {
    expect(validateAndNormalizeTargetUrl('http://127.0.0.1/').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('http://192.168.1.1/').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('http://10.0.0.1/').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('http://0177.0.0.1/').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('http://0x7f.0.0.1/').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('http://2130706433/').valid).toBe(false);
  });

  it('rejects IPv6 literals', () => {
    expect(validateAndNormalizeTargetUrl('http://[::1]/').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('http://[fe80::1]/').valid).toBe(false);
  });

  it('rejects special-use and internal domains (localhost, .local, .internal, cloud metadata)', () => {
    expect(validateAndNormalizeTargetUrl('http://localhost/').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('http://server.local/').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('http://service.internal/').valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('http://metadata.google.internal/').valid).toBe(false);
  });

  it('handles .example domain only when explicitly allowed for tests', () => {
    expect(validateAndNormalizeTargetUrl('https://skole.example', false).valid).toBe(false);
    expect(validateAndNormalizeTargetUrl('https://skole.example', true).valid).toBe(true);
  });
});
