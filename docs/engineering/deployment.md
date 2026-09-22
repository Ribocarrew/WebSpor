# Deployment og driftsrunbook

Ingen deployment er oprettet af denne dokumentationspakke. GitHub er autoritativ kilde. Netlify bygger kun frontend; scanner kræver separat EU-infrastruktur med verificeret isolation/gateway. Netlify-konfiguration skrives først sammen med et testet frontendbuild; antag ikke platformlimits eller region ud fra navn.

## Miljøer

Local: syntetiske fixtures, ingen offentlige mål som default. PR-preview: frontend med permanent demo og ingen produktionssecrets. Staging: fuld isoleret scanner med kontrollerede testmål og lavt budget. Production: først efter releasegate; ingen automatisk adgang fra vilkårlige Netlify preview-origins.

## Konfigurationskontrakt

| Felt | Placering | Regel |
|---|---|---|
| PUBLIC_API_BASE_URL | Frontend | Offentlig URL, aldrig en secret |
| SCAN_ENABLED | Admission | Default false; kill switch |
| ALLOWED_ORIGINS | API | Eksplicitte frontend-origins; ingen wildcard med credentials |
| QUEUE/REPORT_STORE forbindelse | Kontrolplan secret store | Aldrig worker/frontend |
| TOKEN_HASH_KEY, RATE_HMAC_KEY | Kontrolplan secret store | Separat formål og rotation; ingen log |
| EGRESS_POLICY_VERSION | Supervisor | Matcher testet infrastruktur |
| DAILY_SCAN_BUDGET | Admission | Påkrævet konkret tal før live, atomisk håndhævet |
| AI_ENABLED | API | Default false; særskilt godkendt leverandør og budget |

Eksakte miljøvariabelnavne for lager vælges med leverandør og føres i `.env.example`. Ingen fabrikation af fungerende credentials eller deploykommandoer.

## Første deployment

1. Luk ADR-007/008/010: hosting, databehandling/kontakt og budget. Vælg vedligeholdte versioner, pin dependencylock og image digests.
2. Opret separate staging/prod-secrets, netværk, lager-TTL, workerpool og gateway. Test, at worker ikke kan nå kontrolplan eller cloudmetadata.
3. Deploy API/scanner i staging. Kør T-01..T-16 i relevant omfang, inklusive faktisk egress og sletning. Dokumentér begrænsninger og upstream TLS-kontrol.
4. Forbind GitHub til Netlify, vælg godkendt branch og verificeret buildkommando/outputmappe fra appen. Deploypreview bruger demo. Opsæt frontend-CSP, no-referrer og SPA-ruter uden at omskrive API-fejl til HTML.
5. Gennemfør manuel UX/accessibility, privatlivstekst og kontaktvej. Smoke-test med eget kontrolleret offentligt mål.
6. Deploy kompatibel release til produktion med SCAN_ENABLED=false. Verificér health og secrets. Aktivér lavt budget efter dokumenteret releasebeslutning. Overvåg første jobs; udvid kun efter kapacitetsreview.

## Drift

Mål kølængde, jobvarighed, fejlrate pr. reason code, workercrash, policyblokeringer, slettelatens og budget. Ingen URL/IP/token i metricslabels. Alarm ved slettelatens over 60 sekunder, uventet egress, gentagne crash eller schemafejl. Navngiv vagtansvarlig før pilot; ingen opfundet SLA.

## Kill switch og hændelser

Ved forbudt egress, mulig datalæk eller sandboxproblem: slå admission fra, stop aktive workers, begræns relevante credentials og isolér berørt komponent. Bevar kun nødvendig redigeret hændelsesevidens. Vurdér persondatabrud med ansvarlig; lovpligtige frister og anmeldelse afgøres på faktiske hændelser og gældende regler, ikke automatisk af scanneren. Genåbning kræver reproduktion, fix og regressionstest.

## Rollback

Slå scan fra, lad sikre jobs afslutte eller annullér dem, deploy sidste kompatible API/scanner/image og frontend. Bekræft schema-kompatibilitet, TTL og tokenkontrol før genåbning. Gendan aldrig slettede rapporter eller gammel rå kø fra backup. Klassifikationskilder rulles kun tilbage til dokumenteret godkendt version med synlig versionsændring. Kør kontrolleret smoke-test og registrér beslutningen.
