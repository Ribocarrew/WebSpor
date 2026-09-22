import React from 'react';
import { TechnicalChecksDetail } from '@webspor/contracts';
import { technicalChecksExplanations, ExplanationLevel } from '@webspor/content';

interface TechnicalChecksSectionProps {
  details?: TechnicalChecksDetail;
  level: ExplanationLevel;
}

export const TechnicalChecksSection: React.FC<TechnicalChecksSectionProps> = ({ details, level }) => {
  const checkKeys = ['https', 'hsts', 'csp', 'referrerPolicy', 'nosniff', 'frameProtection'] as const;

  const renderBadge = (status: boolean | null | undefined) => {
    if (status === true) {
      return <span className="badge badge-complete">Bestået</span>;
    }
    if (status === false) {
      return <span className="badge badge-failed">Mangler / Ikke bestået</span>;
    }
    return <span className="badge badge-neutral">Uafklaret</span>;
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '16px' }}>
        <h2>Seks observerede beskyttelsessignaler (I-04)</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Tekniske indstillinger målt på den endelige HTML-forside. Viser kun tilstedeværelse af grundlæggende browserinstrukser, ikke websitets samlede IT-sikkerhed.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {checkKeys.map((key) => {
          const exp = technicalChecksExplanations[key];
          const status = details ? details[key] : null;

          return (
            <div
              key={key}
              style={{
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-input)',
                padding: '16px',
                background: 'var(--surface-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', margin: 0 }}>{exp.label}</h3>
                  {renderBadge(status)}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {exp[level]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
