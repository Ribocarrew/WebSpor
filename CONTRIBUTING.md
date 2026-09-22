# Bidrag til WebSpor

Læs [dokumentationsoversigten](docs/README.md), [engineering rules](docs/engineering/rules.md) og [do-not-do](docs/engineering/do-not-do.md). Installationskommandoer til appen tilføjes først, når de er implementeret og afprøvet.

Opret en branch fra main. Beskriv problemet, krav-ID'er, ændret adfærd og validering i en pull request. Maintainer gennemgår og merger efter relevante checks. Opdater kontrakter, metodeversion og fixtures, hvis observationer eller beregninger ændrer betydning. Ingen live-scans i CI eller persondata i eksempler.

Dokumentation skrives på dansk med stabile engelske filnavne og kodeidentifikatorer. Kilder skal have URL, besøgsdato og afgrænset formål. Eksterne klassifikationsdata skal have provenance, version, licens og opdateringspolitik.

Review: Kan alle påstande spores? Er ukendt adskilt fra nul? Påvirkes SSRF, persondata, tilgængelighed eller AI-grænser? Er relevante tests kørt og ikke-kørte tests oplyst? Er ændringen fri for hemmeligheder? Sikkerhedsproblemer følger [SECURITY.md](SECURITY.md).
