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
| ADR-008 | Open — blokerer offentlig pilot | Udfyld dataansvarlig, leverandørkort, behandlingsgrundlag, privat kontaktvej og vilkår | Ingen falsk færdig privatlivspolitik |
| ADR-009 | Open — blokerer formålslabels | Vælg tracker-datasæt med egnet licens/provenance; alternativ er ingen kilde | Uden kilde: formål ukendt og I-03=null |
| ADR-010 | Open — blokerer live | Operatør, dagligt globalt budget, alarmer og rollbackansvar | Ingen ubegrænset offentlig ressourcebrug |
| ADR-011 | Proposed | React/Vite og strict TypeScript-monorepo, Node-kontrolplan | Pin vedligeholdte versioner ved build |
| ADR-012 | Accepted | Rapport 60 min, ingen public sharing/backups, token i hukommelse | Reload mister adgang; JSON kan gemmes manuelt |
| ADR-013 | Accepted | Kun GET/HEAD, 30 sek. browserfase og ressourcegrænser | Tracking kan underobserveres; begrænsninger vises fast |
| ADR-014 | Accepted | Desktop-first, fuldt responsiv, fire brandfarver, WCAG 2.2 AA-mål | Kontrast og keyboard testes i alle states |

## Detaljer og alternativer

ADR-005: En universel 0–100-risikoscore blev fravalgt, fordi én baseline ikke dokumenterer virksomhedspraksis eller helhedssikkerhed. Indikatoren måler kun seks specificerede tekniske signaler; den skal undertrykkes ved ukendt delkontrol.

ADR-007: Playwright request interception alene fravalgt som sikkerhedsgrænse. En generisk container er ikke tilstrækkelig dokumentation for fjendtlige browsere. Vælg efter demonstration af testmatrix, omkostningsramme, EU-datalivscyklus og patchansvar. TLS-inspektion påvirker målingen og skal dokumenteres; alternativ arkitektur skal kunne håndhæve de samme kontroller.

ADR-012: Offentlig deling og serverhistorik fravalgt i V1 for at minimere datalæk, retention og adgangsmodel. Brugeren kan eksportere sin redigerede rapport; eksportkopien er uden for tjenestens sletning.

## Ny beslutning

Tilføj ID, dato, status, ejer/reviewer, problem, alternativer, valgt løsning, konsekvenser, berørte dokumenter og verificering. Gamle beslutninger slettes ikke; markér superseded med efterfølger. Produktets ejer skal tage åbne produkt-/driftsvalg; implementationsteamet må ikke opfinde navn, kontakt eller juridisk grundlag.
