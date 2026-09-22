import React, { useState, useId } from 'react';
import { validateAndNormalizeTargetUrl } from '@webspor/rules';

interface HomePageProps {
  onStartScan: (targetUrl: string) => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartScan, onNavigate }) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const inputId = useId();
  const errorId = useId();
  const helpId = useId();

  const validation = validateAndNormalizeTargetUrl(inputVal, false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasInteracted(true);
    if (validation.valid && validation.canonicalUrl) {
      onStartScan(validation.canonicalUrl);
    }
  };

  const handleQuickExample = (domain: string) => {
    setInputVal(domain);
    setHasInteracted(true);
  };

  return (
    <div>
      {/* Hero section */}
      <div style={{ textAlign: 'center', margin: '40px auto 32px auto', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--brand-teal)', marginBottom: '8px' }}>
          WebSpor
        </h1>
        <p style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Se sporene bag websitet.
        </p>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto' }}>
          Undersøg hvilke eksterne forbindelser, cookies og tekniske beskyttelser der observeres ved et første, passivt sidebesøg i en standardbrowser.
        </p>
      </div>

      {/* Scan input card */}
      <div className="card" style={{ maxWidth: '720px', margin: '0 auto 36px auto', border: '2px solid var(--border-default)' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor={inputId} className="input-label" style={{ fontSize: '17px' }}>
              Indtast websitets adresse:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                id={inputId}
                type="text"
                className="text-input"
                style={{ flex: 1, minWidth: '240px' }}
                placeholder="f.eks. dr.dk eller dmi.dk"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setHasInteracted(true);
                }}
                aria-describedby={`${helpId} ${hasInteracted && !validation.valid ? errorId : ''}`}
                aria-invalid={hasInteracted && !validation.valid}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!validation.valid}
                style={{ padding: '0 28px' }}
              >
                Undersøg
              </button>
            </div>

            {/* Live feedback */}
            {inputVal.trim() && validation.valid && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--state-success)' }}>
                ✓ Normaliseret mål: <code>{validation.canonicalUrl}</code>
              </div>
            )}

            {hasInteracted && !validation.valid && inputVal.trim() && (
              <div id={errorId} className="input-error" role="alert">
                ⚠ {validation.errorMessage}
              </div>
            )}

            {/* Privacy notice / input guidance */}
            <p id={helpId} className="input-help" style={{ marginTop: '12px', fontSize: '13px', lineHeight: 1.5 }}>
              🔒 <strong>Privatlivsadvarsel:</strong> Indtast kun offentlige websites. Undgå links med personlige parametre, login-koder eller links modtaget i private e-mails.
            </p>
          </div>
        </form>

        {/* Demo shortcut */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Vil du blot se systemet i funktion?
          </div>
          <button
            type="button"
            className="btn btn-amber"
            style={{ fontSize: '14px', padding: '6px 14px', minHeight: '36px' }}
            onClick={() => onNavigate('/demo')}
          >
            Se fiktiv demonstration →
          </button>
        </div>
      </div>

      {/* 3 Principles cards */}
      <div className="grid-cards" style={{ maxWidth: '1024px', margin: '0 auto' }}>
        <div className="card col-4">
          <h3 style={{ color: 'var(--brand-teal)' }}>1. Passivt sidebesøg</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            WebSpor klikker aldrig på knapper, accepterer ikke cookiedialoger og udfylder ingen formularer. Vi observerer sidens rå grundadfærd for en førstegangsbesøgende.
          </p>
        </div>

        <div className="card col-4">
          <h3 style={{ color: 'var(--brand-teal)' }}>2. Evidens frem for domme</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Ingen opdigtede sikkerhedskarakterer fra 0 til 100. WebSpor måler konkrete, tekniske kendsgerninger og viser tydeligt, hvad vi ikke kan vide.
          </p>
        </div>

        <div className="card col-4">
          <h3 style={{ color: 'var(--brand-teal)' }}>3. Radikal dataminimering</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Ingen login, ingen brugerkonti og ingen historik. Alle scanninger og tokens slettes automatisk efter 60 minutter.
          </p>
        </div>
      </div>
    </div>
  );
};
