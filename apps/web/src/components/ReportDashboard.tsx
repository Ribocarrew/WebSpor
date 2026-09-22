import React, { useState } from 'react';
import { ScanReport } from '@webspor/contracts';
import { ExplanationLevel, explanationLevelsMeta } from '@webspor/content';
import { CoveragePanel } from './CoveragePanel.js';
import { OverviewCards } from './OverviewCards.js';
import { TechnicalChecksSection } from './TechnicalChecksSection.js';
import { FindingsList } from './FindingsList.js';
import { EvidenceTable } from './EvidenceTable.js';

interface ReportDashboardProps {
  report: ScanReport;
  onDelete?: () => void;
  isDemo?: boolean;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  report,
  onDelete,
  isDemo = false,
}) => {
  const [level, setLevel] = useState<ExplanationLevel>('brief');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const durationSec = (
    (new Date(report.finishedAt).getTime() - new Date(report.startedAt).getTime()) /
    1000
  ).toFixed(1);

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webspor-rapport-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const redirectHappened = report.target.requestedOrigin !== report.target.finalOrigin;

  return (
    <div>
      {/* Target and metadata header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Undersøgt destination
              </span>
              {report.status === 'completed' && <span className="badge badge-complete">Vellykket</span>}
              {report.status === 'partial' && <span className="badge badge-partial">Delvist scan</span>}
              {report.status === 'failed' && <span className="badge badge-failed">Fejlet</span>}
              {isDemo && <span className="badge badge-demo">Fiktiv Demo</span>}
            </div>

            <h1 style={{ fontSize: '28px', margin: 0, wordBreak: 'break-all' }}>
              {report.target.finalOrigin}
            </h1>

            {redirectHappened && (
              <div style={{ marginTop: '6px', fontSize: '14px', color: 'var(--brand-amber)' }}>
                <strong>Bemærk:</strong> Du indtastede <code>{report.target.requestedOrigin}</code>, men browseren blev omdirigeret til <code>{report.target.finalOrigin}</code>.
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span>Tid: <strong>{new Date(report.startedAt).toLocaleTimeString('da-DK')}</strong></span>
              <span>Varighed: <strong>{durationSec} sek.</strong></span>
              <span>Region: <strong>{report.environment.region}</strong></span>
              <span>Browser: <strong>{report.environment.browserVersion.split('/')[0]}</strong></span>
              <span>Udløber: <strong>{new Date(report.expiresAt).toLocaleTimeString('da-DK')}</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={handleDownloadJson}>
              Eksportér JSON
            </button>
            {onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Slet rapport nu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Explanation level selector (F-09) */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>Vælg forklaringsniveau:</span>{' '}
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {explanationLevelsMeta[level].description}
            </span>
          </div>

          <div className="level-selector" role="radiogroup" aria-label="Forklaringsniveau">
            {(['brief', 'learnMore', 'technical'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                role="radio"
                aria-checked={level === lvl}
                className={`level-btn ${level === lvl ? 'active' : ''}`}
                onClick={() => setLevel(lvl)}
              >
                {explanationLevelsMeta[lvl].title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage panel */}
      <CoveragePanel
        collectors={report.collectors}
        limitations={report.limitations}
      />

      {/* 4 Overview indicators */}
      <OverviewCards
        indicators={report.indicators}
        level={level}
      />

      {/* Technical Checks detail */}
      <TechnicalChecksSection
        details={report.indicators['I-04'].details}
        level={level}
      />

      {/* Structured findings */}
      <FindingsList
        findings={report.findings}
        observations={report.observations}
        level={level}
      />

      {/* Full evidence table */}
      <EvidenceTable observations={report.observations} />

      {/* Integrity card */}
      <div className="card" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong>Integritetskontrol:</strong> {report.integrity.algorithm} over {report.integrity.canonicalization} kanonisk JSON
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--surface-canvas)', padding: '4px 8px', borderRadius: '4px' }}>
            SHA-256: {report.integrity.digest}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowDeleteModal(false);
          }}
        >
          <div
            className="card"
            style={{ maxWidth: '480px', width: '100%', margin: 0 }}
          >
            <h3 id="modal-title" style={{ fontSize: '20px', color: 'var(--state-error)', marginBottom: '12px' }}>
              Slet denne rapport?
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '15px' }}>
              Dette sletter øjeblikkeligt rapporten og adgangstokenet. Handlingen kan ikke fortrydes. Data kan ikke genskabes bagefter.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Fortryd
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowDeleteModal(false);
                  if (onDelete) onDelete();
                }}
              >
                Ja, slet permanent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
