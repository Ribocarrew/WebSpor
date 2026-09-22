# Instruktioner til kodeagenter

Gælder hele repoet. Læs [projektgrundlag](docs/00-project-charter.md), [Antigravity](docs/engineering/antigravity.md), [engineering rules](docs/engineering/rules.md), [do-not-do](docs/engineering/do-not-do.md), [evidens](docs/engine/evidence-classification.md), [sikkerhed](docs/architecture/security.md) og [releasekrav](docs/engineering/release-criteria.md) før implementation.

Dokumenterne er normative målkrav, ikke bevis for eksisterende funktioner. Opdater status og tests sammen med implementationen. Opfind aldrig målinger eller testresultater. Ingen production fallback til fixtures. Ingen domænebaserede særregler for konklusioner eller score. Registrér dokumentkonflikter i decision log; vælg den mere begrænsende adfærd indtil afklaring. Implementér små verificerbare trin med krav-ID'er. Ændringer af sikkerhedsgrænser, datalagring eller V1-scope kræver en eksplicit dokumenteret produktbeslutning.
