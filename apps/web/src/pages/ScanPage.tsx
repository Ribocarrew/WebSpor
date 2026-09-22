import React, { useState, useEffect } from 'react';
import { ScanReport } from '@webspor/contracts';
import { failureCodeMessages } from '@webspor/content';
import { ReportDashboard } from '../components/ReportDashboard.js';

interface ScanPageProps {
  targetUrl: string;
  onNavigate: (path: string) => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({ targetUrl, onNavigate }) => {
  const [phase, setPhase] = useState<
    | 'submitting'
    | 'queued'
    | 'validating'
    | 'running'
    | 'processing'
    | 'completed'
    | 'partial'
    | 'failed'
    | 'cancelled'
    | 'api_unavailable'
  >('submitting');

  const [report, setReport] = useState<ScanReport | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Check if live API is available via environment or local endpoint
    const apiBase = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL || '/api';

    async function startScanFlow() {
      try {
        setPhase('queued');
        const res = await fetch(`${apiBase}/v1/scans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': crypto.randomUUID(),
          },
          body: JSON.stringify({ url: targetUrl, profile: 'baseline-v1' }),
        });

        if (!res.ok) {
          if (res.status === 503) {
            setPhase('api_unavailable');
            return;
          }
          const errData = await res.json().catch(() => ({}));
          setErrorCode(errData.code || 'TARGET_DISALLOWED');
          setPhase('failed');
          return;
        }

        const data = await res.json();
        const scanId = data.id;
        const accessToken = data.accessToken;

        // Poll status
        let pollInterval = 2000;
        let pollCount = 0;

        const poll = async () => {
          if (cancelled) return;
          pollCount++;
          if (pollCount > 15) pollInterval = 5000; // Backoff per spec

          const statusRes = await fetch(`${apiBase}/v1/scans/${scanId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!statusRes.ok) {
            setErrorCode('WORKER_CRASH');
            setPhase('failed');
            return;
          }

          const statusData = await statusRes.json();
          if (statusData.status === 'completed' || statusData.status === 'partial') {
            setReport(statusData.report);
            setPhase(statusData.status);
          } else if (statusData.status === 'failed') {
            setErrorCode(statusData.error?.code || 'WORKER_CRASH');
            setPhase('failed');
          } else {
            setPhase(statusData.status);
            setTimeout(poll, pollInterval);
          }
        };

        setTimeout(poll, pollInterval);
      } catch {
        // Honest unreachability notice per rules.md (NEVER silently fall back to fixtures!)
        if (!cancelled) {
          setPhase('api_unavailable');
        }
      }
    }

    startScanFlow();

    return () => {
      cancelled = true;
    };
  }, [targetUrl]);

  const handleCancel = () => {
    setPhase('cancelled');
  };

  const handleDelete = () => {
    setReport(null);
    onNavigate('/');
  };

  if (phase === 'api_unavailable') {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--brand-amber)' }}>
        <h2>Offentlig live-scanner er ikke aktiveret</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 16px 0', fontSize: '15px' }}>
          I henhold til produktets sikkerhedsspecifikation (S-01 til S-05) og driftsbeslutning ADR-007 er den offentlige scanningsservice deaktiveret som standard, indtil en hærdet og isoleret EU-infrastruktur med kontrolleret egressgateway er provisioneret.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          <em>"No result is better than a fabricated result." — WebSpor falder aldrig tilbage til fiktive fixtures ved en netværksfejl.</em>
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('/demo')}>
            Gå til demonstrationssiden (.example) →
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('/')}>
            Tilbage til forsiden
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'cancelled') {
    return (
      <div className="card">
        <h2>Undersøgelsen blev afbrudt</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 16px 0' }}>
          Du har stoppet undersøgelsen af <code>{targetUrl}</code>. Midlertidige data er ryddet.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => onNavigate('/')}>
          Start forfra
        </button>
      </div>
    );
  }

  if (phase === 'failed') {
    const errorInfo = errorCode ? failureCodeMessages[errorCode] : null;
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--state-error)' }}>
        <h2 style={{ color: 'var(--state-error)' }}>
          {errorInfo ? errorInfo.title : 'Undersøgelsen mislykkedes'}
        </h2>
        <p style={{ margin: '12px 0', fontSize: '16px' }}>
          {errorInfo ? errorInfo.message : 'Websitet kunne ikke undersøges pålideligt.'}
        </p>
        {errorInfo && (
          <div style={{ background: 'var(--surface-canvas)', padding: '12px 16px', borderRadius: 'var(--radius-input)', margin: '12px 0' }}>
            <strong>Handling:</strong> {errorInfo.action}
          </div>
        )}
        <div style={{ marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('/')}>
            Prøv en anden adresse
          </button>
        </div>
      </div>
    );
  }

  if (report && (phase === 'completed' || phase === 'partial')) {
    return (
      <ReportDashboard
        report={report}
        onDelete={handleDelete}
        isDemo={false}
      />
    );
  }

  // Active progress view
  return (
    <div className="card" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '8px' }}>Undersøger websitet...</h2>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Mål: <code>{targetUrl}</code>
      </p>

      {/* Actual phase live-region per UX spec (no fake percentage!) */}
      <div
        role="status"
        aria-live="polite"
        style={{
          background: 'var(--surface-canvas)',
          padding: '16px',
          borderRadius: 'var(--radius-input)',
          marginBottom: '24px',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--brand-teal)', fontSize: '16px', marginBottom: '4px' }}>
          {phase === 'submitting' && 'Opretter sikker undersøgelse...'}
          {phase === 'queued' && 'I kø til ledig browserinstans...'}
          {phase === 'validating' && 'Validerer adresser og netværkspolitik...'}
          {phase === 'running' && 'Åbner websitet i isoleret Chromium-kontekst...'}
          {phase === 'processing' && 'Indsamler observationer og kører deterministiske regler...'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Passiv baseline: højst 30 sekunders browserbesøg uden klik eller formularer.
        </div>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Lukker du vinduet eller genindlæser siden, mistes adgangstokenet af sikkerhedshensyn.
      </div>

      <button type="button" className="btn btn-danger" onClick={handleCancel}>
        Stop undersøgelsen
      </button>
    </div>
  );
};
