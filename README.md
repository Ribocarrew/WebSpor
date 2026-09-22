# WebSpor

**Se sporene bag websitet.** WebSpor skal gøre synlige forbindelser, cookies og tekniske beskyttelser forståelige og efterprøvelige. Dansk først; engelsk senere. For 7.-10. klasse, privatpersoner og professionelle.

> No result is better than a fabricated result.

## Status

Repoet indeholder byggegrundlaget til V1. Der er endnu ingen implementeret scanner, webapp eller produktionsdeployment. Dokumentationen beskriver krav, ikke eksisterende funktionalitet. MIT-licensen bevares; eksterne datasæt skal licensvurderes særskilt.

## Start her

1. Læs [projektgrundlaget](docs/00-project-charter.md).
2. Brug [dokumentationsoversigten](docs/README.md).
3. Ved implementering: læs [AGENTS.md](AGENTS.md) og [Antigravity-instruktionerne](docs/engineering/antigravity.md).
4. Følg [roadmap](docs/engineering/roadmap.md) og [releasekrav](docs/engineering/release-criteria.md).

V1: offentlig webapp uden login, ét anonymt besøg på en offentlig side via separat isoleret Playwright/Chromium-scanner. Frontend via GitHub til Netlify. Ingen pentesting, formularafsendelser, login, køb eller domænespecifikke vurderinger. AI må alene forklare strukturerede fund.

Se [CONTRIBUTING.md](CONTRIBUTING.md) og [SECURITY.md](SECURITY.md). Metode, usikkerhed og versionshistorik skal kunne læses uden at køre appen.
