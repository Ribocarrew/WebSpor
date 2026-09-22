# Antigravity-instruktioner

Antigravity er implementeringsværktøj; repoets dokumentation er produktets autoritative grundlag. Dette dokument antager ingen bestemte Antigravity-funktioner eller versionsafhængige kommandoer.

## Læs før kode

Start med [AGENTS.md](../../AGENTS.md), [grundlag](../00-project-charter.md), [do-not-do](do-not-do.md), [sikkerhed](../architecture/security.md), [privacy](../governance/privacy-data-governance.md), [evidens](../engine/evidence-classification.md), [API](../architecture/api-contract.md) og [decision log](../decisions/decision-log.md). Fortsæt via [dokumentationskortet](../README.md) med produkt/design, scan, scoring, tests og release.

## Arbejdsmåde

1. Inspicér eksisterende filer og git-status. Bevar brugerændringer og licens.
2. Angiv kort scope, relevante krav-ID'er og hvilke åbne beslutninger der påvirker trinnet.
3. Implementér fase 1 først: kontrakt, redaktion, regler og klart syntetisk demo. Ingen rigtig scanning før netværksgrænsen er testet.
4. Byg én vertikal funktion ad gangen og medtag fejl/partial. Vælg rutinemæssige biblioteksdetaljer selv inden for kravene; dokumentér væsentlige arkitekturbeslutninger.
5. Kør passende checks, angiv faktisk resultat og ikke-kørte tests. Stop ikke ved en flot UI, hvis evidens/fejl ikke virker.
6. Opdater status og relevante dokumenter. Opret reviewbar ændring med problem, løsning, test og åbne gates.

Hvis en nødvendig driftsbeslutning mangler, fortsæt uafhængigt arbejde på kontrakt/UI/fixtures, og markér live-scan som blokeret. Gæt ikke hosting, databehandlingsgrundlag, kontaktperson eller budget. Deaktivér ikke en sikkerhedskontrol for at få et demoresultat.

## Startprompt til første build

```text
Byg WebSpor V1 efter AGENTS.md og hele docs/README.md-læsestien.
Start med at inspicere repoet og læse projektgrundlag, do-not-do, sikkerhed,
privacy, evidens, API, scoring, design, tests og releasekrav.

Implementér fase 1 i roadmap: strict TypeScript-struktur, runtime schemas,
komplette syntetiske success/partial/failed-fixtures, deterministiske regler,
redaktion og et responsivt dansk dashboard med tre forklaringsniveauer.
Brug #1F6F78, #E39A3B, #F6F3EC og #2F3C4A efter designsystemet.
Demo skal være permanent mærket og må ikke være fallback for live-scans.

Forbered derefter scanner/API efter den beskrevne faseorden. Aktivér aldrig
offentlig scanning før SSRF, faktisk egress, isolation, kvoter og sletning er
testet. Frontend skal på Netlify; browserworker skal være separat og isoleret.
Ingen login, klik, formularer, køb, pentest eller domænespecifikke domme.
AI må alene forklare strukturerede fund og er deaktiveret som standard.
No result is better than a fabricated result.

Lav små reviewbare ændringer med krav-ID'er, faktisk testresultat og opdateret
dokumentation. Slut med præcis status: implementeret, verificeret, ikke
verificeret og åbne releaseblokeringer. Påstå ikke produktionsparathed alene
fordi UI eller lokale tests virker.
```

Første prompt er bevidst faseafgrænset. Fortsæt derefter roadmap uden at ændre produktets sikkerheds- eller evidensgrænser. Et samlet build kan gennemføres i flere iterationer uden at miste det fælles grundlag.
