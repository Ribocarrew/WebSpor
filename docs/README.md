# Dokumentationskort

Specifikationen til første build, ikke dokumentation af færdig software. Dato: 2026-09-22. Start med [projektgrundlaget](00-project-charter.md).

## Produkt og læring

- [Vision](product/vision.md)
- [Målgrupper](product/audiences.md)
- [Informationsarkitektur](product/information-architecture.md)
- [Features og acceptkrav](product/feature-specification.md)
- [Læringsmodel](product/learning-model.md)
- [Tone of voice](product/tone-of-voice.md)

## Design

- [Brand, logo og afsender](design/brand.md)
- [Designsystem og stilprofil](design/design-system.md)
- [UX](design/ux.md)
- [Tilgængelighed](design/accessibility.md)

## Scanner

- [Scan engine](engine/scan-engine.md)
- [Evidens og klassifikation](engine/evidence-classification.md)
- [Scoring og dækning](engine/scoring.md)
- [Fejltilstande](engine/failure-states.md)

## Arkitektur og styring

- [Teknisk arkitektur](architecture/technical-architecture.md)
- [API-kontrakt](architecture/api-contract.md)
- [Sikkerhed, SSRF og misbrug](architecture/security.md)
- [Privacy og data governance](governance/privacy-data-governance.md)
- [AI-boundaries](governance/ai-boundaries.md)

## Build og drift

- [Engineering rules](engineering/rules.md)
- [Testing og kravmatrix](engineering/testing.md)
- [Deployment og runbook](engineering/deployment.md)
- [Release criteria](engineering/release-criteria.md)
- [Roadmap](engineering/roadmap.md)
- [Antigravity og startprompt](engineering/antigravity.md)
- [Do-not-do](engineering/do-not-do.md)
- [Decision log](decisions/decision-log.md)
- [Primærkilder](references.md)

Antigravity læser: grundlag → do-not-do → sikkerhed/privacy → evidens/API → engine/scoring → features → UX/design → testing/release → roadmap. Produktreview starter med vision og UX. Sikkerhedsreview starter med arkitektur, sikkerhed, engine og datalivscyklus.
