import React from 'react';
import { metodePageContent } from '@webspor/content';

export const MetodePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: 'var(--brand-teal)' }}>{metodePageContent.title}</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {metodePageContent.lead}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {metodePageContent.sections.map((sec, idx) => (
          <div key={idx} className="card">
            <h2 style={{ fontSize: '20px', color: 'var(--brand-teal)', marginBottom: '8px' }}>
              {sec.heading}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {sec.text}
            </p>
          </div>
        ))}
      </div>

      <div className="card" style={{ background: 'var(--surface-canvas)', borderLeft: '4px solid var(--brand-amber)' }}>
        <h3 style={{ marginBottom: '8px' }}>Epistemisk model (observation frem for formodning)</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          WebSpor opdeler alle konklusioner i fire adskilte lag:
        </p>
        <ul style={{ paddingLeft: '20px', marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <li><strong>Direkte observeret:</strong> Browserhændelse der fandt sted under scanningen (f.eks. modtaget svar eller gemt cookie).</li>
          <li><strong>Kildematch:</strong> Observation matchet med et eksternt, godkendt versionsstyret datasæt.</li>
          <li><strong>Faglig fortolkning:</strong> En snæver, teknisk forklaring tilknyttet fundet.</li>
          <li><strong>Ukendt:</strong> Manglende dækning eller uafklaret formål. Vises altid eksplicit som "ukendt" – aldrig som nul eller sikkert.</li>
        </ul>
      </div>
    </div>
  );
};
