# Release criteria

En offentlig V1 kræver alle obligatoriske punkter. Afkryds kun med konkret commit/testartefakt, reviewer og dato. Denne fil er en tom gate, ikke en erklæring om at krav er opfyldt.

| Gate | Krav | Status |
|---|---|---|
| R-01 Produkt | F-01..F-13 og F-15 fungerer; ingen udvidet scope skjult i UI | Ikke verificeret |
| R-02 Evidens | Alle fund har gyldig provenance; eksport genberegner; null/0 korrekt | Ikke verificeret |
| R-03 Sikkerhed | T-01..T-04 og T-10..T-11 bestået i repræsentativ isolation/gateway | Ikke verificeret |
| R-04 Ressourcer | T-15 og globale/identitets-/målkvoter håndhævet; kill switch testet | Ikke verificeret |
| R-05 Privacy | TTL/sletning/logredaktion testet; ansvarlig, vilkår, leverandører og kontakt udfyldt | Ikke verificeret |
| R-06 UX | Elever, privatpersoner og professionelle forstår begrænsninger; ingen mislæst sikkerhedsgaranti | Ikke verificeret |
| R-07 Accessibility | Manuel matrix og automatiske checks; ingen blokerende afvigelser | Ikke verificeret |
| R-08 Drift | Staging, rollback, budget, overvågning og navngiven ejer | Ikke verificeret |
| R-09 Supply chain | Lockfile, image digest, licenser, dependency/secret scan | Ikke verificeret |
| R-10 Indhold | Dansk korrekt, metode offentlig, ingen domænehardcoding eller juridiske domme | Ikke verificeret |
| R-11 AI | Deaktiveret, eller separat AI-gate fuldt dokumenteret | Ikke verificeret |
| R-12 Brand | Accepttest i [brand.md](../design/brand.md) bestået; ingen forældede farver i kode; nul eksterne kald for logo, favicon og fonte | Ikke verificeret |

Security/privacyfejl, opdigtede resultater, skjult fallback, tokenlæk, forbudt egress og ukorrekt ukendt→nul er ubetingede stop. En demo-only preview kan deles som sådan før live-gate, men må ikke beskrives som fungerende scanner.

Releaseartefakt skal indeholde commit, schema/profil/engine/ruleset/datasætversioner, resultat af hver gate, kendte begrænsninger og rollbackversion. Maintainer er releaseansvarlig; navngiven sikkerheds-/driftsreviewer skal udfyldes før offentlig pilot. Dokumentationsreview alene er ikke tilladelse til at aktivere scanning.
