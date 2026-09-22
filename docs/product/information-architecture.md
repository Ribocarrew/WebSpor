# Informationsarkitektur

| Rute | Indhold | Indeksering |
|---|---|---|
| `/` | URL-felt, rammer, scan, demo | Ja |
| `/scan` | Job og rapport; token kun i hukommelsen | Nej |
| `/demo` | Fiktiv rapport med permanent demo-label | Ja |
| `/metode` | Scope, regler, versioner og begrænsninger | Ja |
| `/laer` | Begreber og opgaver | Ja |
| `/privatliv` | Faktisk behandling, opbevaring, kontakt | Ja |
| `/om` | Formål, open source, ansvarlig organisation | Ja |

Global navigation: Undersøg · Lær · Metode · Om. Footer: Privatliv, GitHub, version og verificeret kontakt. Ingen inaktiv sprogknap. Fremtidig `/en/` kræver oversættelsesreview.

## Rapporthierarki

1. Status, tidspunkt, undersøgt origin, baseline uden klik, region og varighed.
2. Begrænsninger og dækning før indikatorer.
3. Overblik over forbindelser, cookies og tekniske kontroller.
4. Sektioner: Forbindelser · Cookies og lagring · Tekniske signaler · Evidens.
5. Fund: observation → klassifikation → betydning → ukendt → grundlag.
6. Metodeversioner, JSON-eksport og sletning.

Ingen offentligt rapportkatalog eller delbare rapportlinks i V1. Genindlæsning mister token; forklar dette ved rapporten. Tilbageknappen skal fungere; navigation væk tilbyder annullering af aktivt job.

UI-tekst ligger i `da`-katalog; læringsindhold i versionerede redaktionelle data; observationer i rapport; klassifikationer i deterministiske regler. Ingen domænespecifikke resultatskabeloner.
