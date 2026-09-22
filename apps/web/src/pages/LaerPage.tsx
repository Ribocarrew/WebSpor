import React, { useState } from 'react';
import { laerPageContent, dictionaryTerms } from '@webspor/content';

export const LaerPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTerms = dictionaryTerms.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: 'var(--brand-teal)' }}>{laerPageContent.title}</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {laerPageContent.lead}
        </p>
        <p style={{ fontSize: '16px', color: 'var(--brand-amber)', fontWeight: 600, marginTop: '8px' }}>
          {laerPageContent.pedagogicalIntro}
        </p>
      </div>

      {/* 20-minute lesson exercise card */}
      <div className="card" style={{ borderLeft: '4px solid var(--brand-teal)' }}>
        <h2>{laerPageContent.lessonPlan.duration} i klassen</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
          Kort undervisningsøvelse for 7.–10. klasse med WebSpors fiktive demonstration:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {laerPageContent.lessonPlan.steps.map((st) => (
            <div
              key={st.step}
              style={{
                background: 'var(--surface-canvas)',
                padding: '12px',
                borderRadius: 'var(--radius-input)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className="badge badge-complete">{st.step}. {st.title}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({st.time})</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {st.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dictionary section */}
      <div className="card">
        <h2>Ordbog over digitale spor ({filteredTerms.length})</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
          Slå centrale faglige begreber op og forstå hvad teknologien gør i praksis.
        </p>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <input
            type="search"
            className="text-input"
            style={{ maxWidth: '320px', minHeight: '40px' }}
            placeholder="Søg i begreber..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Alle' },
              { id: 'netvaerk', label: 'Netværk' },
              { id: 'cookies_storage', label: 'Cookies & lagring' },
              { id: 'sikkerhed', label: 'Sikkerhed' },
              { id: 'metode', label: 'Metode' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                className={`btn btn-secondary ${activeCategory === c.id ? 'btn-primary' : ''}`}
                style={{ fontSize: '13px', padding: '4px 12px', minHeight: '38px' }}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terms list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredTerms.map((t) => (
            <div
              key={t.term}
              style={{
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-input)',
                padding: '16px',
                background: 'var(--surface-canvas)',
              }}
            >
              <h3 style={{ fontSize: '17px', color: 'var(--brand-teal)', marginBottom: '6px' }}>
                {t.term}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.5 }}>
                {t.definition}
              </p>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <strong>Eksempel:</strong> {t.example}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <em>Forbehold: {t.limitation}</em>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
