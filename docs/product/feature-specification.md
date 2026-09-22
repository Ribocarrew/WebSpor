# Features og acceptkrav

MUST er releasekrav. AI er valgfrit og må ikke blokere V1.

| ID | Funktion | Prioritet | Acceptkrav |
|---|---|---|---|
| F-01 | URL-input | MUST | Bare domæner får HTTPS; vis normaliseret mål. Afvis credentials, query, fragment, IP-literals, ikke-HTTP(S) og andre porte end 80/443. Ingen tavs ændring af fulde links. |
| F-02 | Jobs | MUST | Servervalidering; job og adgangstoken; reelle faser uden opdigtet procent; dobbeltklik giver ét job. |
| F-03 | Baseline | MUST | Én side, frisk browser, ingen klik, scroll, login, formularer eller rettigheder. Blokeringer synliggøres. |
| F-04 | Forbindelser | MUST | Skeln forsøg, afvist før forbindelse, svar og fejl. Kontaktantal kræver response-observation. |
| F-05 | Cookies/storage | MUST | Gemte cookie-attributter og storage-antal; aldrig værdier. Set-Cookie-forsøg er ikke lagret cookie. |
| F-06 | Tekniske kontroller | MUST | Final response: HTTPS, HSTS, CSP, Referrer-Policy, X-Content-Type-Options, framebeskyttelse. Ingen sikkerhedsdom. |
| F-07 | Klassifikation | MUST | Regel-ID/version, evidens og kilde. Umatchet destination er ukendt. Tredjepart betyder ikke tracker. |
| F-08 | Dækning/indikatorer | MUST | Følg scoring-specifikation; ingen samlet sikkerhedskarakter. Manglende data er null, aldrig nul. |
| F-09 | Forklaringsniveauer | MUST | Kort fortalt, Lær mere, Teknisk; uændrede fund og forbehold. |
| F-10 | Evidens | MUST | Åbn redigeret observation med tidspunkt og metode; ugyldige referencer afviser fund. |
| F-11 | JSON | MUST | Redigeret rapport og versioner; ingen token, cookie-værdi, rå path/query eller HTML. |
| F-12 | Stop/slet | MUST | Stop worker, tilbagekald token, slet rapport; idempotent og automatisk TTL. |
| F-13 | Læring/demo | MUST | Fiktive `.example`-data med permanent mærkning. Aldrig fallback ved fejl. |
| F-14 | AI-forklaring | MAY | Valideret input, evidenshenvisninger, statisk fallback; ingen ændring af rapport. |
| F-15 | Responsiv/tilgængelig | MUST | WCAG 2.2 AA-mål og testmatrix opfyldt. |

## Acceptscenarier

Afvist mål starter ingen browser og lækker ingen interne IP'er. Timeout med gyldige fund giver delvis rapport; indikatorer uden fuldt nødvendigt datagrundlag undertrykkes. Cookie-collector med nul fund giver »Ingen gemte cookies observeret i dette besøg«; collectorfejl giver »Kunne ikke undersøges«. Ukendt ekstern destination giver »Tredjepart; formål ukendt«. AI-nedbrud påvirker ikke evidens. Manglende scannerkonfiguration giver ærlig utilgængelighed, aldrig demoresultat som live.

## Uden for V1

Konti, historik, delte scans, rapportkatalog, ranking, bulk, crawling, samtykkeklik, browserudvidelse, aktiv fingerprinting-instrumentering, PDF og fri AI-chat. Funktioner uden implementation må ikke fremstå som beståede kontroller.
