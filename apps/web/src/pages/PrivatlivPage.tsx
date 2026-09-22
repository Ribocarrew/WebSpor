import React from 'react';
import { privatlivPageContent, siteInfo } from '@webspor/content';

export const PrivatlivPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: 'var(--brand-teal)' }}>{privatlivPageContent.title}</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {privatlivPageContent.lead}
        </p>
      </div>

      {/* Datalivscyklus tabel */}
      <div className="card">
        <h2>Datalivscyklus og slettefrister</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
          WebSpor opbevarer kun kortlivede tekniske målinger og ingen personlige profiler eller browsing-historik.
        </p>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Datatype</th>
                <th scope="col">Formål og opbevaring</th>
                <th scope="col">Maksimal levetid (TTL)</th>
              </tr>
            </thead>
            <tbody>
              {privatlivPageContent.dataLifecycle.map((d, i) => (
                <tr key={i}>
                  <td><strong>{d.data}</strong></td>
                  <td style={{ fontSize: '14px' }}>{d.storage}</td>
                  <td><span className="badge badge-complete">{d.retention}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Minimering ved indsamling */}
      <div className="card">
        <h2>Hvad WebSpor ALDRIG indsamler</h2>
        <ul style={{ paddingLeft: '20px', fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.8 }}>
          <li>Ingen cookie-værdier eller hemmelige tokens (kun navne og tekniske attributter).</li>
          <li>Ingen rå HTML, sideskærmbilleder (screenshots) eller sidens tekstindhold.</li>
          <li>Ingen URL-forespørgselsparametre (query strings <code>?foo=bar</code>) eller fragmenter (<code>#ref</code>).</li>
          <li>Ingen elevprofiler, brugerkonti, skolenavne eller adfærdstracking.</li>
          <li>Ingen tredjepartsanalyse- eller tracking-scripts på selve WebSpor-webappen.</li>
        </ul>
      </div>

      {/* Kontaktvej */}
      <div className="card" style={{ borderLeft: '4px solid var(--brand-teal)' }}>
        <h2>Kontakt vedrørende privatliv</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px' }}>
          {privatlivPageContent.contactText}
        </p>
        <p style={{ fontSize: '16px', fontWeight: 600 }}>
          Jacob Witt-Larsen · <a href={`mailto:${siteInfo.contactEmail}`}>{siteInfo.contactEmail}</a>
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Sandboxmodellen · <a href={siteInfo.websiteUrl} target="_blank" rel="noopener noreferrer">{siteInfo.websiteUrl}</a>
        </p>
      </div>
    </div>
  );
};
