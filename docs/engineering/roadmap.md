# Roadmap

Ingen datoer eller kapacitetsløfter er fastlagt. Faser afsluttes på evidens, ikke på kalender.

| Fase | Leverance | Exit |
|---|---|---|
| 0 — Grundlag | Denne dokumentation, review af åbne ADR'er | Scope og risiko forstået |
| 1 — Kontrakt og demo | Runtime schemas, fulde syntetiske fixtures, rules, redaktion, tre forklaringsniveauer | Null/0, evidensreferencer og I-04 kan testes uden browser |
| 2 — Sikker scanbane | Valgt hosting/gateway, isoleret worker, URL/DNS/egress og ressourcegrænser | SSRF-/isolationtests bestået før offentlig trafik |
| 3 — V1 collectors og API | Passiv baseline, token, kvoter, sletning, rapport | Kontrollerede ende-til-ende tests og datalivscyklus |
| 4 — Færdig UI | Responsivt dashboard, læring, evidens og JSON | Brugertest og accessibilitymatrix |
| 5 — Staging/pilot | Netlify frontend, EU-scanner, drift/privacy og releaseevidens | Alle R-gates; derefter begrænset offentlig V1 |
| 6 — Efter V1 | Engelsk, vurderet datasæt, eventuelt AI-forklaring | Egne acceptance/releasegates |

Senere muligheder: dokumenteret samtykkesammenligning, fingerprinting-instrumentering, PDF, historik og eksplicit rapportdeling. Hver ændrer målegrundlag eller dataansvar og kræver ny ADR/trusselsmodel. Konti tilføjes kun ved konkret dokumenteret behov. Crawling, pentest og domænebaserede domme er ikke planlagte udvidelser.

AI eller spektakulære visualiseringer må ikke forsinke evidens, fejltilstande og sikkerhed. Første build er en sammenhængende, afgrænset V1; produktionsparathed kan ikke garanteres af ét prompt.
