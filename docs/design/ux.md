# UX og brugerforløb

## Fra input til evidens

1. Forsiden forklarer, at besøget er anonymt, offentligt og uden klik. Vis advarsel mod personlige links og et eksempel med almindeligt domæne.
2. Brugeren skriver URL; normalisering vises under feltet. Klientfejl har konkret løsning. Serveren validerer igen.
3. Ved start vises kø/fase og »Stop undersøgelsen«. Ingen løfte om præcis sluttid. Jobbet startes kun ved eksplicit handling.
4. Rapporten åbner med status og dækning. Ved partial står det øverst, ikke nederst.
5. Brugeren vælger forklaringsniveau, åbner et fund og »Se grundlaget«. Filtre må ikke ændre rapportens tal.
6. Brugeren kan eksportere redigeret JSON eller slette rapporten. Vis udløbstid og at reload mister adgang.

## UI-tilstande

Idle, input-error, submitting, queued, validating, running, processing, completed, partial, failed, cancelled, expired, disconnected. Hver tilstand har overskrift, forklaring og relevant næste handling. Ingen aktiv scan-knap under submitting. Ved 429 respekteres Retry-After uden automatisk nyt job. Ved connection loss fortsæt kun polling efter backoff.

Målændring ved redirect vises: »Du bad om A; besøget endte på B«. Paths vises ikke i rapporten. En anderledes slutadresse er ikke i sig selv tegn på misbrug. Login-/betalings-/CAPTCHA-side stopper meningsfuld vurdering; appen giver ikke vejledning til at omgå den.

## Progressive detaljer

Default er »Kort fortalt«. Forklaringsniveau og sektion ændrer ikke observationer. Teknik er tilgængelig uden login. Fundets usikkerhed skjules aldrig i det simple niveau. Tom liste siger præcist, om der er nul observerede fund eller ingen data. Totaler skal være mærket, hvis de kun gælder synlige filtrerede rækker.

## Mobile og tastatur

Samme funktioner på alle størrelser. Scaninput stables; kort bliver én kolonne. Lange origins brydes uden at skjule identiteten. Tabeller kan scrolle lokalt og har tekstlig hjælp; hele siden må ikke scrolle vandret. Sticky navigation må ikke skjule fokus eller fejl. Ingen drag-only interaktion.

## Brugertest

Test fem opgaver: start med gyldigt mål, ret afvist URL, forstå partial, find evidens, slet/eksportér. Test med elever, privatpersoner og professionelle samt tastatur og skærmlæser. Spørg »Hvad kan du konkludere?« efter et fund. Hvis deltagere læser en indikator som sikkerhedsgaranti, skal navn/placering ændres før release.
