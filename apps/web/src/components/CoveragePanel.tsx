import React from 'react';
import { Collectors, CollectorStatus } from '@webspor/contracts';
import { collectorExplanations } from '@webspor/content';

interface CoveragePanelProps {
  collectors: Collectors;
  limitations: string[];
}

export const CoveragePanel: React.FC<CoveragePanelProps> = ({ collectors, limitations }) => {
  const collectorEntries = Object.entries(collectors) as [keyof Collectors, Collectors[keyof Collectors]][];
  const completeCount = collectorEntries.filter(([_, c]) => c.status === 'complete').length;

  const renderStatusBadge = (status: CollectorStatus) => {
    switch (status) {
      case 'complete':
        return <span className="badge badge-complete">Fuldført</span>;
      case 'partial':
        return <span className="badge badge-partial">Delvis</span>;
      case 'failed':
        return <span className="badge badge-failed">Fejlet</span>;
      case 'not_run':
        return <span className="badge badge-neutral">Ikke kørt</span>;
    }
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--brand-teal)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Undersøgelsens dækning</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <strong>{completeCount} af 5</strong> tekniske undersøgelser fuldført inden for passiv baseline.
          </p>
        </div>
        <div style={{ background: 'var(--surface-canvas)', padding: '6px 12px', borderRadius: 'var(--radius-input)', fontSize: '13px' }}>
          <span>Profil: <strong>baseline-v1</strong> (kun GET/HEAD, 0 klik)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
        {collectorEntries.map(([name, c]) => {
          const info = collectorExplanations[name];
          return (
            <div
              key={name}
              style={{
                background: 'var(--surface-canvas)',
                padding: '12px',
                borderRadius: 'var(--radius-input)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{info ? info.title : name}</span>
                {renderStatusBadge(c.status)}
              </div>
              {c.reasonCode && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Årsag: <code>{c.reasonCode}</code>
                </div>
              )}
              {typeof c.droppedCount === 'number' && c.droppedCount > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--brand-amber)' }}>
                  {c.droppedCount} hændelser frasorteret (loft nået)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {limitations.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-default)', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <strong>Begrænsninger i dette scan:</strong>
          <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
            {limitations.map((lim, idx) => (
              <li key={idx}>
                {lim === 'PASSIVE_BASELINE_NO_CLICK' && 'Ingen klik på samtykkebannere eller formularer (passiv baseline).'}
                {lim === 'GET_HEAD_ONLY' && 'Kun HTTP GET og HEAD tilladt; POST/WebSockets er blokeret.'}
                {lim === 'SINGLE_ORIGIN_VISIT' && 'Kun ét sidebesøg undersøgt; undersider og brugerhistorik er ikke analyseret.'}
                {lim === 'NAVIGATION_TIMEOUT' && 'Sidens navigation overskred tidsgrænsen (15s); delvise data bevaret.'}
                {lim === 'RESOURCE_LIMIT' && 'Ressourcegrænse nået under scanningen.'}
                {lim === 'NO_TRACKER_DATASET_LOADED' && 'Intet eksternt tracker-datasæt tilknyttet i V1; formålsklassifikation er ukendt.'}
                {![
                  'PASSIVE_BASELINE_NO_CLICK',
                  'GET_HEAD_ONLY',
                  'SINGLE_ORIGIN_VISIT',
                  'NAVIGATION_TIMEOUT',
                  'RESOURCE_LIMIT',
                  'NO_TRACKER_DATASET_LOADED',
                ].includes(lim) && lim}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
