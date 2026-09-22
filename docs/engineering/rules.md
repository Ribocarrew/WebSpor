# Engineering rules

## Kode og kontrakter

TypeScript strict, eksplicitte runtime schemas ved alle tillidsgrænser. Ingen `any` til eksterne data. Del kontrakter mellem API, worker, regler og UI. Valider både syntaks og semantik: observation-referencer, collectorstatus og indikatorgrundlag. Undgå dobbeltimplementeret scoring i frontend. Regler er rene funktioner med version og faste fixtures.

Hold netværksadmission, browserindsamling, redaktion, klassifikation, beregning, forklaring og UI adskilt. Fejl er typede, ikke magiske tomme arrays. Null er ukendt, 0 er målt nul. Ingen catch, der returnerer »sikker« eller demo.

## Repository og dependencies

Én package manager vælges og låses ved bootstrap. Commit lockfile; CI bruger frozen install. Pin Playwright/browser som kompatibelt par og container ved digest. Ingen ukontrollerede runtime-downloads eller remote trackerfeeds. Vurder dependencylicens, vedligeholdelse, transitive risici og SBOM. Undgå unødvendige UI- og analytics-SDK'er.

Secrets ligger i driftsplatformens secret store. `.env.example` må kun indeholde feltnavne og ufarlige placeholders. Browser-worker har ingen secrets. Logger bruger tilladte felter; aldrig fri serialisering af request/error-objekter. Errorstack kan indeholde URL'er og skal redigeres før logning.

## Mock og demo

Fixtures ligger kun i test/demo-pakker og har `.example`-domæner. Production API kan ikke importere dem. Demo-route har permanent mærkning; deployment uden API viser utilgængelighed. Buildtest skal bevise, at en netværksfejl ikke aktiverer fixtures. Generiske regeltests må ikke referere til rigtige brands som expected verdict.

## Arbejdsgang og definition of done

Små branches og pull requests. Beskriv problem, krav-ID, ændret adfærd, tests og kendte begrænsninger. Opdater dokumentation i samme PR. Refaktorering må ikke ændre metode skjult. Sikr læsbar dansk UI og locale-keys fra start; engelske tekster kommer senere.

En feature er færdig, når acceptscenarier, passende tests, tilgængelighed, redaktion og fejlsvar er verificeret, og det kan vises, hvad den faktisk måler. Testresultater må ikke opfindes. Et grønt screenshot er ikke en integrationstest. Åbne releaseblokeringer føres eksplicit, ikke gemt i TODO-kommentarer.
