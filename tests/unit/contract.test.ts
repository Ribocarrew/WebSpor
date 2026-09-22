import { describe, it, expect } from 'vitest';
import {
  ScanReportSchema,
  validateReportSemantics,
  verifyReportIntegrity,
} from '@webspor/contracts';
import { fixtures } from '@webspor/fixtures';

describe('Contract and Fixture validation', () => {
  it('validates success fixture against schema and semantics', () => {
    expect(() => ScanReportSchema.parse(fixtures.success)).not.toThrow();
    const errors = validateReportSemantics(fixtures.success);
    expect(errors).toHaveLength(0);
    expect(verifyReportIntegrity(fixtures.success)).toBe(true);
  });

  it('validates partial fixture against schema and semantics', () => {
    expect(() => ScanReportSchema.parse(fixtures.partial)).not.toThrow();
    const errors = validateReportSemantics(fixtures.partial);
    expect(errors).toHaveLength(0);
    expect(verifyReportIntegrity(fixtures.partial)).toBe(true);
  });

  it('validates failed fixture against schema and semantics', () => {
    expect(() => ScanReportSchema.parse(fixtures.failed)).not.toThrow();
    const errors = validateReportSemantics(fixtures.failed);
    expect(errors).toHaveLength(0);
    expect(verifyReportIntegrity(fixtures.failed)).toBe(true);
  });

  it('detects integrity violation if report content is tampered with', () => {
    const tampered = JSON.parse(JSON.stringify(fixtures.success));
    tampered.engineVersion = '9.9.9'; // Tamper
    expect(verifyReportIntegrity(tampered)).toBe(false);
  });

  it('rejects dangling evidence IDs via semantic validation', () => {
    const invalidReport = JSON.parse(JSON.stringify(fixtures.success));
    invalidReport.findings.push({
      id: 'f-fake-01',
      ruleId: 'RULE_TEST',
      ruleVersion: '1.0.0',
      category: 'network',
      epistemicStatus: 'observed',
      evidenceIds: ['obs-non-existent-999'], // Dangling ID!
      sourceRefs: [],
      explanationKey: 'test',
      limitations: [],
      title: 'Fake finding',
    });

    const errors = validateReportSemantics(invalidReport);
    expect(errors.some((e) => e.field.includes('evidenceIds'))).toBe(true);
  });

  it('rejects indicator claiming non-null value when collector is partial', () => {
    const invalidReport = JSON.parse(JSON.stringify(fixtures.success));
    invalidReport.collectors.network.status = 'partial';
    invalidReport.indicators['I-01'].value = 5; // Should be null!

    const errors = validateReportSemantics(invalidReport);
    expect(errors.some((e) => e.field === 'indicators.I-01.value')).toBe(true);
  });
});
