import React from 'react';
import { Indicators } from '@webspor/contracts';
import { indicatorExplanations, ExplanationLevel } from '@webspor/content';

interface OverviewCardsProps {
  indicators: Indicators;
  level: ExplanationLevel;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ indicators, level }) => {
  const i01 = indicators['I-01'];
  const i02 = indicators['I-02'];
  const i03 = indicators['I-03'];
  const i04 = indicators['I-04'];

  const exp01 = indicatorExplanations['I-01'];
  const exp02 = indicatorExplanations['I-02'];
  const exp03 = indicatorExplanations['I-03'];
  const exp04 = indicatorExplanations['I-04'];

  return (
    <div className="grid-cards">
      {/* I-01 */}
      <div className="card col-3" style={{ borderTop: '4px solid var(--brand-teal)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          Indikator I-01
        </div>
        <h3 style={{ marginTop: '4px', fontSize: '16px' }}>{exp01.title}</h3>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 6px 0' }}>
          {i01.value !== null ? i01.value : '—'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {i01.value !== null ? 'unikke 3.-parts domæner' : `Ikke vurderet (${i01.reasonCode || 'delvis data'})`}
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border-default)', paddingTop: '8px' }}>
          {exp01[level]}
        </p>
      </div>

      {/* I-02 */}
      <div className="card col-3" style={{ borderTop: '4px solid var(--brand-teal)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          Indikator I-02
        </div>
        <h3 style={{ marginTop: '4px', fontSize: '16px' }}>{exp02.title}</h3>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 6px 0' }}>
          {i02.value !== null ? i02.value : '—'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {i02.value !== null ? (i02.value === 0 ? 'Ingen cookies gemt' : `${i02.value} cookies i browserlager`) : `Ikke vurderet (${i02.reasonCode || 'delvis data'})`}
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border-default)', paddingTop: '8px' }}>
          {exp02[level]}
        </p>
      </div>

      {/* I-03 */}
      <div className="card col-3" style={{ borderTop: '4px solid var(--brand-amber)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          Indikator I-03
        </div>
        <h3 style={{ marginTop: '4px', fontSize: '16px' }}>{exp03.title}</h3>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 6px 0' }}>
          {i03.value !== null ? i03.value : '—'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {i03.value !== null ? `${i03.value} matchede trackere` : 'Ukendt (ingen ekstern kilde i V1)'}
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border-default)', paddingTop: '8px' }}>
          {exp03[level]}
        </p>
      </div>

      {/* I-04 */}
      <div className="card col-3" style={{ borderTop: '4px solid var(--brand-teal)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          Indikator I-04
        </div>
        <h3 style={{ marginTop: '4px', fontSize: '16px' }}>{exp04.title}</h3>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 6px 0' }}>
          {i04.value !== null ? `${i04.value}%` : '—'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {typeof i04.passedChecksCount === 'number'
            ? `${i04.passedChecksCount} af 6 kontroller bestået`
            : `Ikke vurderet (${i04.reasonCode || 'delvis data'})`}
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border-default)', paddingTop: '8px' }}>
          {exp04[level]}
        </p>
      </div>
    </div>
  );
};
