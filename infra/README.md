# Infrastruktur og deployment

Dette katalog beskriver containeropsætning og netværksgrænser for WebSpors adskilte services.

## Komponenter

1. **Frontend (Netlify):**
   - Statisk SPA bygget med Vite og React.
   - Konfigureret i `netlify.toml` med stram CSP, `Referrer-Policy: no-referrer`, og SPA-routing.
   - Netværkskald sker kun til godkendt API-adresse (eller ren demo-tilstand).

2. **API & Admission (services/api):**
   - Node.js / Express mikroservice.
   - Validerer URL (S-01), håndhæver IP-HMAC kvoter (S-04), udsteder 256-bit kryptografiske adgangstokens (S-05).
   - `SCAN_ENABLED=false` som standard (kill switch).

3. **Scanner Worker (services/scanner):**
   - Isoleret Playwright/Chromium instans.
   - Kører som non-root bruger (`pwuser`) med Chromium sandbox slået til.
   - Ingen certifikatbypass (`ignoreHTTPSErrors: false`).
   - Begrænset egress: kun GET/HEAD mod godkendte offentlige destinationer.

## Åbne driftsbeslutninger før offentlig live-scanning (Gates)

- **ADR-007:** Valg af EU-hosting og gateway med verificerbar socket-/metode-/bytekontrol samt microVM-isolation.
- **ADR-008:** Juridisk dataansvarlig og formel databehandleraftale.
- **ADR-010:** Operatør, dagligt globalt budget, alarmer og rollbackansvar.

Før disse gates er lukket og verificeret i staging, forbliver `SCAN_ENABLED=false`.
