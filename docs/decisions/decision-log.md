# Decision log

2026-09-22. Accepted betyder valgt design, ikke implementeret/verificeret. Proposed er et konkret buildforslag, som kan ændres med dokumenteret begrundelse. Open blokerer kun de angivne efterfølgende trin.

| ID | Status | Beslutning og begrundelse | Konsekvens |
|---|---|---|---|
| ADR-001 | Accepted | Offentlig MIT-webapp, dansk først, 7.-10. klasse primært | Engelsk senere; samme evidens til alle |
| ADR-002 | Accepted | Ingen login; passiv baseline uden klik | Ingen samtykkesammenligning eller personlige scans |
| ADR-003 | Accepted | Netlify frontend + separat isoleret Chromium | Scanner kan ikke placeres som almindeligt frontendjob |
| ADR-004 | Accepted | Evidens før deterministiske regler før forklaring | Ukendt/null, versioner og provenance obligatorisk |
| ADR-005 | Accepted | Ingen samlet sikkerhedsscore; snæver 6-punktsindikator | Forklaring og alle kriterier vises; ingen risikoranking |
| ADR-006 | Accepted | AI valgfri forklaring, default off | V1 kan fungere uden AI-leverandør |
| ADR-007 | Open — blokerer live | Vælg EU-hosting, joblager og gateway med verificerbar socket-/metode-/bytekontrol samt stærk isolation | Infrastrukturreview og stagingtests før offentlig trafik |
| ADR-008 | Open — blokerer offentlig pilot | Udfyld dataansvarlig, leverandørkort, behandlingsgrundlag og vilkår; kontaktadresse valgt i ADR-015, kontaktflow verificeres før pilot | Ingen falsk færdig privatlivspolitik |
| ADR-009 | Open — blokerer formålslabels | Vælg tracker-datasæt med egnet licens/provenance; alternativ er ingen kilde | Uden kilde: formål ukendt og I-03=null |
| ADR-010 | Open — blokerer live | Operatør, dagligt globalt budget, alarmer og rollbackansvar | Ingen ubegrænset offentlig ressourcebrug |
| ADR-011 | Accepted | React/Vite og strict TypeScript-monorepo, Node-kontrolplan | Pin vedligeholdte versioner ved build |
| ADR-012 | Accepted | Rapport 60 min, ingen public sharing/backups, token i hukommelse | Reload mister adgang; JSON kan gemmes manuelt |
| ADR-013 | Accepted | Kun GET/HEAD, 30 sek. browserfase og ressourcegrænser | Tracking kan underobserveres; begrænsninger vises fast |
| ADR-014 | Accepted | Desktop-first, fuldt responsiv, fire brandfarver, WCAG 2.2 AA-mål | Kontrast og keyboard testes i alle states |
| ADR-015 | Accepted | Brand: Sandboxmodellens låste palette, Inter/JetBrains Mono selvhostet, logo via @ribocarrew/sandboxmodellen-assets, Sandboxmodellen som afsender | Se [brand.md](../design/brand.md). Gamle farver forældede. Kontakt: jaco227e@lollandskoler.dk |
| ADR-016 | Accepted | V1 foundation build: contracts (Zod), deterministic scoring (RFC 8785 SHA-256), synthetic fixtures, responsive dashboard med 3 forklaringsniveauer, separat scanner/API, og SCAN_ENABLED=false som standard | ADR-007, ADR-008 og ADR-010 forbliver åbne gates før offentlig scanning |

## Detaljer og alternativer

ADR-005: En universel 0–100-risikoscore blev fravalgt, fordi én baseline ikke dokumenterer virksomhedspraksis eller helhedssikkerhed. Indikatoren måler kun seks specificerede tekniske signaler; den skal undertrykkes ved ukendt delkontrol.

ADR-007: Playwright request interception alene fravalgt som sikkerhedsgrænse. En generisk container er ikke tilstrækkelig dokumentation for fjendtlige browsere. Vælg efter demonstration af testmatrix, omkostningsramme, EU-datalivscyklus og patchansvar. TLS-inspektion påvirker målingen og skal dokumenteres; alternativ arkitektur skal kunne håndhæve de samme kontroller.

ADR-012: Offentlig deling og serverhistorik fravalgt i V1 for at minimere datalæk, retention og adgangsmodel. Brugeren kan eksportere sin redigerede rapport; eksportkopien er uden for tjenestens sletning.

ADR-015: 2026-09-22. Ejer: Jacob Witt-Larsen. Den tidligere palette (#1F6F78, #E39A3B, #F6F3EC, #2F3C4A) erstattes af Sandboxmodellens låste palette. Systemfont erstattes af selvhostet Inter og JetBrains Mono; kravet om ingen eksterne fontrequests fastholdes. Logo hentes kun fra npm-pakken og skaleres ved build. LOGO_SIMPELT er valgt som hovedlogo, fordi fodsporene på chippen udtrykker produktets idé. Afsender er Sandboxmodellen / teknologivejlederen.dk. Jacob har valgt [jaco227e@lollandskoler.dk](mailto:jaco227e@lollandskoler.dk) som kontaktadresse; den er ikke længere et åbent valg. Dette fastlægger ikke i sig selv den juridisk dataansvarlige eller driftsansvaret. Berørte dokumenter: brand.md, design-system.md, antigravity.md, AGENTS.md, docs/README.md, information-architecture.md, learning-model.md, release-criteria.md og README.md. Brandkravene verificeres ved R-12 i første build.

## Ny beslutning

Tilføj ID, dato, status, ejer/reviewer, problem, alternativer, valgt løsning, konsekvenser, berørte dokumenter og verificering. Gamle beslutninger slettes ikke; markér superseded med efterfølger. Produktets ejer skal tage åbne produkt-/driftsvalg; implementationsteamet må ikke opfinde navn, kontakt eller juridisk grundlag.
