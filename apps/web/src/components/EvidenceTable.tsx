import React, { useState } from 'react';
import { Observation } from '@webspor/contracts';

interface EvidenceTableProps {
  observations: Observation[];
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({ observations }) => {
  const [filterCollector, setFilterCollector] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = observations.filter((obs) => {
    if (filterCollector === 'all') return true;
    return obs.collector === filterCollector;
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2>Redigeret evidenslog ({observations.length} observationer)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Direkte målinger fra browserens hændelsesstrøm. Personfølsomme data (cookie-værdier, URL-parametre, HTML) er redigeret væk.
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'network', 'cookies', 'storage', 'headers', 'transport'].map((c) => (
            <button
              key={c}
              type="button"
              className={`btn btn-secondary ${filterCollector === c ? 'btn-primary' : ''}`}
              style={{ fontSize: '13px', padding: '4px 10px', minHeight: '32px' }}
              onClick={() => setFilterCollector(c)}
            >
              {c === 'all' && 'Alle'}
              {c === 'network' && 'Netværk'}
              {c === 'cookies' && 'Cookies'}
              {c === 'storage' && 'Lagring'}
              {c === 'headers' && 'Headere'}
              {c === 'transport' && 'Transport'}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '120px' }}>ID</th>
              <th scope="col" style={{ width: '140px' }}>Type</th>
              <th scope="col" style={{ width: '100px' }}>Collector</th>
              <th scope="col">Resumé af data</th>
              <th scope="col" style={{ width: '90px' }}>Detaljer</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((obs) => {
              const isExpanded = !!expandedRows[obs.id];
              let summary = '';

              if (obs.kind === 'request_attempt') {
                summary = `${obs.data.method} ${obs.data.origin} (${obs.data.resourceType})`;
              } else if (obs.kind === 'response_received') {
                summary = `Status ${obs.data.status} fra ${obs.data.origin}`;
              } else if (obs.kind === 'request_blocked') {
                summary = `Blokeret: ${obs.data.origin} (${obs.data.reasonCode})`;
              } else if (obs.kind === 'cookie_stored') {
                summary = `Navn: ${obs.data.name} @ ${obs.data.domain} (${obs.data.lifetimeCategory})`;
              } else if (obs.kind === 'cookie_set_attempt') {
                summary = `Set-Cookie forsøg: ${obs.data.name}`;
              } else if (obs.kind === 'storage_summary') {
                summary = `${obs.data.mechanism}: ${obs.data.count} poster`;
              } else if (obs.kind === 'header_check') {
                summary = `${obs.data.headerName}: ${obs.data.present ? 'Fundet' : 'Mangler'}`;
              } else if (obs.kind === 'transport') {
                summary = `${obs.data.finalScheme.toUpperCase()} (TLS: ${obs.data.tlsStatus})`;
              }

              return (
                <React.Fragment key={obs.id}>
                  <tr>
                    <td className="code-font">{obs.id}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
                        {obs.kind}
                      </span>
                    </td>
                    <td>{obs.collector}</td>
                    <td className="code-font" style={{ fontSize: '13px' }}>{summary}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '11px', padding: '3px 8px', minHeight: '26px' }}
                        onClick={() => toggleRow(obs.id)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? 'Luk' : 'Vis'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ background: 'var(--surface-canvas)' }}>
                      <td colSpan={5} style={{ padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Tidspunkt: {obs.observedAt}
                        </div>
                        <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', margin: 0, overflowX: 'auto' }}>
                          {JSON.stringify(obs.data, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
