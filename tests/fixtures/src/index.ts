import { ScanReport } from '@webspor/contracts';
import successJson from './success.json' with { type: 'json' };
import partialJson from './partial.json' with { type: 'json' };
import failedJson from './failed.json' with { type: 'json' };

export const successFixture = successJson as unknown as ScanReport;
export const partialFixture = partialJson as unknown as ScanReport;
export const failedFixture = failedJson as unknown as ScanReport;

export const fixtures = {
  success: successFixture,
  partial: partialFixture,
  failed: failedFixture,
};
