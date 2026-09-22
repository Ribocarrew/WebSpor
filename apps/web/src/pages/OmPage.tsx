import React from 'react';
import { omPageContent, siteInfo } from '@webspor/content';

export const OmPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      {/* Exact markup from docs/design/brand.md */}
      <div style={{ marginBottom: '24px' }}>
        <picture>
          <source srcset="/brand/logo-om.webp" type="image/webp" />
          <img
            src="/brand/logo-om.png"
            alt="Sandboxmodellens logo: en computerchip med fodspor"
            width="240"
            height="240"
            style={{ borderRadius: '16px' }}
          />
        </picture>
      </div>

      <h1 style={{ color: 'var(--brand-teal)', marginBottom: '16px' }}>
        {omPageContent.title}
      </h1>

      {/* Exact text required by brand.md lines 168-176 */}
      <div className="card" style={{ textAlign: 'left', margin: '0 auto 24px auto', fontSize: '17px', lineHeight: 1.7 }}>
        <p style={{ marginBottom: '16px', fontWeight: 600 }}>
          Se på chippen: der er fodspor. Hver gang du besøger en hjemmeside, efterlader du spor. WebSpor viser dem.
        </p>
        <p>
          WebSpor er bygget efter Sandboxmodellens princip: <strong>Tænk før du klikker, men klik.</strong> Scanneren klikker ikke. Den besøger siden, viser sporene og lader dig tænke. Klikket er dit, bagefter og med viden.
        </p>
      </div>

      {/* 3 Core principles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left', marginBottom: '32px' }}>
        {omPageContent.principles.map((p, idx) => (
          <div key={idx} className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '16px', color: 'var(--brand-teal)' }}>{p.title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {p.text}
            </p>
          </div>
        ))}
      </div>

      {/* Afsender and contact */}
      <div className="card" style={{ textAlign: 'left', marginBottom: '24px' }}>
        <h3>Afsender</h3>
        <p style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px' }}>
          WebSpor er udviklet af <strong>Jacob Witt-Larsen</strong> fra Sandboxmodellen.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Hjemmeside:{' '}
          <a href={siteInfo.websiteUrl} target="_blank" rel="noopener noreferrer">
            {siteInfo.websiteUrl}
          </a>
          <br />
          Kontakt: <a href={`mailto:${siteInfo.contactEmail}`}>{siteInfo.contactEmail}</a>
        </p>
      </div>

      {/* License notes per brand.md line 219-228 */}
      <div className="card" style={{ textAlign: 'left', background: 'var(--surface-canvas)', borderLeft: '4px solid var(--brand-amber)' }}>
        <h3>Licens</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
          Koden i WebSpor er udgivet under MIT-licensen (se LICENSE i GitHub-repoet).
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Sandboxmodellens logoer og navnet "Sandboxmodellen" er <strong>IKKE</strong> omfattet af MIT-licensen. De tilhører Jacob Witt-Larsen og hentes fra npm-pakken <code>@ribocarrew/sandboxmodellen-assets</code>. Forker du projektet, skal du fjerne eller erstatte logoerne.
        </p>
      </div>
    </div>
  );
};
