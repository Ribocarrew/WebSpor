import React, { useState } from 'react';
import { Finding, Observation } from '@webspor/contracts';
import { ExplanationLevel } from '@webspor/content';

interface FindingsListProps {
  findings: Finding[];
  observations: Observation[];
  level: ExplanationLevel;
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings, observations, level }) => {
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedFindings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getObservationById = (id: string) => {
    return observations.find((o) => o.id === id);
  };

  const renderEpistemicBadge = (status: Finding['epistemicStatus']) => {
    switch (status) {
      case 'observed':
        return <span className="badge badge-complete">Direkte observeret</span>;
      case 'matched':
        return <span className="badge badge-partial">Kildematch</span>;
      case 'inferred':
        return <span className="badge badge-neutral">Faglig fortolkning</span>;
      case 'unknown':
        return <span className="badge badge-neutral">Ukendt formål</span>;
    }
  };

  if (findings.length === 0) {
    return (
      <div className="card">
        <h2>Konkret observerede fund</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ingen specifikke fund registreret for denne undersøgelse.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ marginBottom: '16px' }}>
        <h2>Konkret observerede fund ({findings.length})</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Hvert fund bygger direkte på verificerede observationer. Åbn "Se grundlag" for at inspicere de underliggende hændelser.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {findings.map((finding) => {
          const isExpanded = !!expandedFindings[finding.id];

          return (
            <div
              key={finding.id}
              style={{
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-input)',
                padding: '16px',
                background: 'var(--surface-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '17px', margin: 0 }}>{finding.title}</h3>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className="badge badge-neutral">{finding.category}</span>
                  {renderEpistemicBadge(finding.epistemicStatus)}
                </div>
              </div>

              {finding.description && (
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {finding.description}
                </p>
              )}

              {/* Didactic explanation based on level */}
              <div style={{ background: 'var(--surface-canvas)', padding: '10px 14px', borderRadius: 'var(--radius-input)', marginBottom: '12px', fontSize: '14px' }}>
                <strong>
                  {level === 'brief' && 'Kort fortalt: '}
                  {level === 'learnMore' && 'Lær mere om dette fund: '}
                  {level === 'technical' && 'Teknisk specifikation: '}
                </strong>
                {finding.category === 'network' && (
                  level === 'brief'
                    ? 'Siden kommunikerer med denne server for at hente indhold eller dele data.'
                    : level === 'learnMore'
                    ? 'En netværksforbindelse viser at browseren talte med serveren. Det viser ikke hvad virksomheden gør med dataene bagefter.'
                    : `Regel: ${finding.ruleId} (v${finding.ruleVersion}). eTLD+1 klassificeret mod Public Suffix List.`
                )}
                {finding.category === 'cookies' && (
                  level === 'brief'
                    ? 'Cookien er gemt i browserens hukommelse og kan identificere enheden ved fremtidige sidevisninger.'
                    : level === 'learnMore'
                    ? 'Cookies kan være nødvendige for sidens funktion eller bruges til statistik og markedsføring.'
                    : `Regel: ${finding.ruleId} (v${finding.ruleVersion}). Værdier og stier er udeladt af hensyn til dataminimering.`
                )}
                {finding.category === 'headers' && (
                  level === 'brief'
                    ? 'Sikkerhedsinstruks sendt fra serveren for at beskytte mod misbrug.'
                    : level === 'learnMore'
                    ? 'HTTP-headere sendes før sidens indhold og fortæller browseren hvilke sikkerhedsregler der gælder.'
                    : `Regel: ${finding.ruleId} (v${finding.ruleVersion}). Parsed fra HTTP-respons status.`
                )}
                {finding.category === 'storage' && (
                  level === 'brief'
                    ? 'Websitet gemmer data lokalt på enheden i browserens interne lager.'
                    : level === 'learnMore'
                    ? 'Lokal browserlagring (localStorage) giver websitet mulighed for at gemme information uden cookies.'
                    : `Regel: ${finding.ruleId} (v${finding.ruleVersion}). Kun optælling af nøgler, ingen værdiaflæsning.`
                )}
              </div>

              {finding.limitations.length > 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  <em>Forbehold: {finding.limitations.join(' · ')}</em>
                </div>
              )}

              {/* Expand evidence toggle */}
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '13px', minHeight: '34px', padding: '6px 12px' }}
                onClick={() => toggleExpand(finding.id)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'Skjul grundlag' : `Se grundlag (${finding.evidenceIds.length} observationer)`}
              </button>

              {isExpanded && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    Koblede observationer:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {finding.evidenceIds.map((eid) => {
                      const obs = getObservationById(eid);
                      if (!obs) {
                        return (
                          <div key={eid} style={{ fontSize: '12px', color: 'var(--state-error)' }}>
                            Ukendt observation: {eid}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={eid}
                          style={{
                            background: 'var(--surface-canvas)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-input)',
                            border: '1px solid var(--border-default)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong>{obs.id}</strong> ({obs.kind})
                            <span style={{ color: 'var(--text-muted)' }}>{obs.observedAt}</span>
                          </div>
                          <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {JSON.stringify(obs.data, null, 2)}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
