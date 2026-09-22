# Teststrategi og kravmatrix

Tests bruger kontrollerede syntetiske sider og netværk. Ingen CI-scanning af vilkårlige rigtige websites. Testmiljøets interne fixturemål må kun være tilladt gennem separat testinfrastruktur, aldrig via en production bypass-flag.

## Lag

Unit: URL-parser, IP-policy, domænegrænser/PSL, headerparsers, redaktion, rules, scoring og null-semantik. Property-tests: hostnameændring uden ændring af relationer giver samme indikator; permutation af observationer ændrer ikke resultat; ukendt kan aldrig blive nul; redaktion er idempotent.

Kontrakt: komplette success/partial/failed-rapporter og ugyldige varianter. Afvis dangling evidenceIds, ukendte felter, forkert collectorstatus, for stor rapport, ugyldige versioner og uunderstøttet major. Genberegn hash og indikatorer fra eksporteret rapport.

Integration: virkelig Chromium gennem virkelig egresspolicy i isoleret testnet. Verificér sockets/packet capture, ikke kun mockede routehandlers. Test jobdeadline, kill, oprydning og lager-TTL. Browsercrash og APIcrash skal også rydde data via supervisor/sweeper.

UI/E2E: tastaturflow, URL-fejl, status, partial, null, evidens, eksport, sletning, tabt token, 429 og disconnected. Visuel test af alle states ved mobil/desktop og lange danske tekster. Axe supplerer manuel accessibilityreview.

## Sporbar matrix

| Test-ID | Krav | Fixture/forventning |
|---|---|---|
| T-01 | F-01, S-01 | Credentials, encoding, IP-varianter, IPv6, specialnavne, porte afvises før request |
| T-02 | S-02 | Offentlig→privat redirect, mixed A/AAAA, rebinding, CNAME, IPv4-mapped IPv6; ingen forbudte sockets |
| T-03 | S-02/S-03 | Script-fetch, iframe, websocket, QUIC, WebRTC og alternativ DNS kan ikke omgå gateway |
| T-04 | F-03 | Side med formular/POST/beacon/popup/download; ingen afsendelse eller klik; limitations synlige |
| T-05 | F-04/F-07 | CDN/ukendt/klassificeret destination; blocked attempt tæller ikke kontakt; ingen trackerlabel uden kilde |
| T-06 | F-05 | Set-Cookie afvist versus gemt; SameSite/Secure/HttpOnly, partitionering, tom og fejlet storage |
| T-07 | F-06/F-08 | Alle seks checks, gentagne headers, CSP Report-Only, XFO-præcedens; 4/6=67, unknown=null |
| T-08 | F-10/F-11 | Redigering af tokens i path/query/header/navn og ondsindet HTML; eksport uden hemmeligheder |
| T-09 | F-12 | Cancel/delete under alle faser og crash; ingen genopståen efter retry/restore |
| T-10 | S-04 | Atomiske kvoter med samtidige requests, skole-NAT, målredirect-reservation og budgetstop |
| T-11 | S-05 | Forkert token, gætte-ID, cache/referrer/logs; intet rapportlæk |
| T-12 | F-09/F-13 | Niveauvalg ændrer kun tekst; demo aldrig som live-fallback |
| T-13 | F-14 | Hvis AI: injection, nye tal, nye fakta, ukendt ID, timeout; fallback og uændret rapport |
| T-14 | F-15 | Manuel keyboard/skærmlæser/zoom plus automatiske checks |
| T-15 | Engine | Uendelig stream, stor body, mange origins, CPU-loop; grænser virker og giver korrekt partial/failed |
| T-16 | Governance | TTL, logredaktion, idempotens/tombstone-sletning, deploypreview uden produktionsdata |

## CI og releaseevidens

Før kode findes: Markdown-links, whitespace og strukturreview. Efter bootstrap: format/lint, types, unit/contract, integration, UI og dependency/secret scan. Sikkerhedstests i repræsentativ infrastruktur er særskilt releasegate; grøn lokal test erstatter ikke denne. Gem testversion, commit, miljø, resultat og redigeret artefakt — aldrig rå browsertrace fra offentlige mål.

Ved metoderelease skal golden-fixtures genberegnes og forskelle forklares. Ingen snapshot-opdatering blot for at gøre CI grønt. Komplet matrix er planlagt; ingen af disse tests hævdes kørt, før implementation findes.
