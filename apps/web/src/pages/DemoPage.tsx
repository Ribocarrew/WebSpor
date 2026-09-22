import React, { useState } from 'react';
import { fixtures } from '@webspor/fixtures';
import { failureCodeMessages } from '@webspor/content';
import { ReportDashboard } from '../components/ReportDashboard.js';

export const DemoPage: React.FC = () => {
  const [selectedFixture, setSelectedFixture] = useState<'success' | 'partial' | 'failed'>('success');

  const currentReport = fixtures[selectedFixture];
  const failureInfo = currentReport.error ? failureCodeMessages[currentReport.error.code] : null;

  return (
    <div>
      {/* Permanent, unmissable Demo Banner per F-13 */}
      <div className="demo-banner" role="status">
        <div style={{ fontSize: '24px' }}>ℹ️</div>
        <div>
          <span className="demo-banner-title">
            DEMONSTRATIONSTILSTAND — KUN FIKTIVE DATA (.EXAMPLE)
          </span>
          <span>
            Dette er en pædagogisk demonstration baseret på forhåndsgodkendte, syntetiske testfixtures. Ingen rigtige servere eller websites kontaktes i denne visning.
          </span>
        </div>
      </div>

      {/* Fixture switcher */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Vælg demonstrationsscenarie:</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Skift mellem tre scenarier for at se hvordan WebSpor håndterer succes, timeout og fejl.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${selectedFixture === 'success' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '14px', minHeight: '38px', padding: '6px 14px' }}
              onClick={() => setSelectedFixture('success')}
            >
              1. Vellykket scan (skole.example)
            </button>
            <button
              type="button"
              className={`btn ${selectedFixture === 'partial' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '14px', minHeight: '38px', padding: '6px 14px' }}
              onClick={() => setSelectedFixture('partial')}
            >
              2. Delvist scan med timeout (avis.example)
            </button>
            <button
              type="button"
              className={`btn ${selectedFixture === 'failed' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '14px', minHeight: '38px', padding: '6px 14px' }}
              onClick={() => setSelectedFixture('failed')}
            >
              3. Fejlet scan (lukket.example)
            </button>
          </div>
        </div>
      </div>

      {/* Render failure view or dashboard */}
      {selectedFixture === 'failed' && currentReport.error ? (
        <div className="card" style={{ borderLeft: '4px solid var(--state-error)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-failed">Scanning fejlede</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Destination: <code>{currentReport.target.finalOrigin}</code>
            </span>
          </div>

          <h2 style={{ color: 'var(--state-error)', marginBottom: '8px' }}>
            {failureInfo ? failureInfo.title : currentReport.error.code}
          </h2>

          <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px' }}>
            {failureInfo ? failureInfo.message : 'Der opstod en fejl under undersøgelsen.'}
          </p>

          <div style={{ background: 'var(--surface-canvas)', padding: '12px 16px', borderRadius: 'var(--radius-input)', marginBottom: '16px' }}>
            <strong>Anbefalet handling:</strong> {failureInfo ? failureInfo.action : 'Prøv igen senere.'}
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>Fejlkode: <code>{currentReport.error.code}</code></span>
            <span>Supportreference: <code>{currentReport.error.supportRef}</code></span>
            <span>Kan gentages: <strong>{currentReport.error.retryable ? 'Ja' : 'Nej'}</strong></span>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-default)', fontSize: '14px', color: 'var(--text-muted)' }}>
            <em>
              "No result is better than a fabricated result." — WebSpor opdigter aldrig målinger eller viser en tom succesrapport, når et scan fejler.
            </em>
          </div>
        </div>
      ) : (
        <ReportDashboard
          report={currentReport}
          isDemo={true}
        />
      )}
    </div>
  );
};
