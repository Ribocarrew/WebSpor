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
   - Playwright/Chromium instans til passiv observation.
   - Kører som non-root bruger (`pwuser`) med Chromium standard-sandbox aktiv.
   - Ingen certifikatbypass (`ignoreHTTPSErrors: false`).
   - Applikationslag-filtrering: Playwright `page.route` tillader kun GET/HEAD mod godkendte offentlige destinationer.
   - **VIGTIGT (S-02, S-03):** Playwrights route-filtrering og en standard non-root Docker-container udgør **IKKE** dokumenteret netværks- eller microVM-isolation. De er udelukkende applikationslag-forsvar og intern proceshærdning. Mod fjendtlige mål og browserudnyttelse kræves formel microVM-isolation (f.eks. Firecracker eller gVisor) samt uafhængig socket-niveau egress-gateway før produktion.

## Åbne driftsbeslutninger før offentlig live-scanning (Gates)

- **ADR-007:** Valg af EU-hosting og gateway med verificerbar socket-/metode-/bytekontrol samt hardware-assisteret microVM-isolation.
- **ADR-008:** Juridisk dataansvarlig og formel databehandleraftale.
- **ADR-010:** Operatør, dagligt globalt budget, alarmer og rollbackansvar.

Før disse releasegates er lukket og verificeret i staging, kan offentlig scanning **ikke** aktiveres via konfiguration eller miljøvariable (`SCAN_ENABLED=false`).

