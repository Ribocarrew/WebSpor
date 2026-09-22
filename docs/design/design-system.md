# Designsystem og stilprofil

Retning: roligt, nutidigt nordisk dashboard med didaktisk dybde. Overskuelig første visning, præcise detaljer ved behov. Ingen hackeræstetik, blinkende faresignaler, neon, gamificeret sikkerhedskarakter eller barnlig illustration. Brugerens fire farver er den autoritative brandpalette.

## Tokens

| Token | Værdi | Rolle |
|---|---|---|
| brand.teal | `#1F6F78` | Primær handling, aktive elementer og links |
| brand.orange | `#E39A3B` | Varm accent, udvalgt indhold; ikke universel farefarve |
| surface.canvas | `#F6F3EC` | Sidebaggrund |
| text.primary | `#2F3C4A` | Brødtekst og overskrifter |
| surface.card | `#FFFFFF` | Kort og input |
| border.strong | `#1F6F78` | Fokus og nødvendige komponentgrænser |

Brug slate-tekst på orange, aldrig hvid brødtekst på orange. Teal fungerer til tekst på off-white og hvid tekst på teal; verificér faktiske kombinationer og states med WCAG-beregning ved build. Orange på off-white bruges kun dekorativt uden informationsansvar. Farver må aldrig alene formidle status. Brug ord og ikon: »Observeret«, »Delvist«, »Ukendt«. Fejl skal have ikon/tekst og en kontrastverificeret paletteudvidelse, hvis den eksisterende palette ikke dækker behovet.

## Typografi og rum

Systemfont som default: `system-ui, -apple-system, Segoe UI, sans-serif`. Ingen eksterne fontrequests. Brødtekst 16 px/1.6; sekundær tekst mindst 14 px/1.5; h1 36–48 px/1.15 på desktop, 28–34 px på mobil; h2 24–30 px; h3 20 px. Max læselængde ca. 70 tegn. Tal bruger tabular numerals, tekniske værdier en systemmonospace.

Spacing: 4, 8, 12, 16, 24, 32, 48, 64 px. Kort-radius 16 px, inputs 8 px, badges 999 px. Diskret skygge alene som dybde, aldrig som eneste grænse. Desktop maxbredde 1280 px med 32 px margen; mobil 16 px. 12-kolonne-grid over 1024 px, to kolonner ved 768–1023 px, én kolonne under 768 px. Breakpoints er designvalg, ikke enhedsgarantier.

## Komponentkontrakter

- **URL-input:** synlig label, hjælpetekst, inline fejl med `aria-describedby`, mindst 44 px højde. Enter starter kun ved gyldigt input.
- **Primær knap:** teal med hvid tekst, tydelig hover/fokus/disabled; loading har tekst og forhindrer dobbeltklik.
- **Statuspanel:** faktisk fase og live-region; ingen falsk procent eller pulserende alarm.
- **Fundkort:** titel, observation, epistemisk label, én forklaring, foldbar evidens og begrænsning. Antal og tidspunkt er synlige.
- **Dækningspanel:** fem collectors med tekststatus; partial er visuelt tydelig før indikatorer.
- **Evidenstabel:** semantisk tabel, labels på sortering, tekstombrydning, håndterbar horisontal scroll i egen region på smalle skærme.
- **Forklaringsvælger:** tre navngivne knapper/radiovalg, ikke en uetiketteret skyder. Samme fund forbliver valgt.
- **Detaljepanel:** inline accordion på mobil og desktop; ingen nødvendig information kun i tooltip.
- **Dialog:** kun til begrundet destruktiv handling; fokus ind/tilbage, Escape og synlig luk.

Datavisualisering er sekundær til tekst. Et netværkskort kan vise observerede origin-forbindelser som supplement, men kun efter en fuld tilgængelig tabel findes. Pile betyder request/response, ikke dokumenteret salg eller koncernrelation. Motion 120–180 ms og reduceret ved prefers-reduced-motion. Ingen animation nødvendig for forståelse.

## Skærmopbygning

Forside: kort formålslinje, stort URL-input, tydelig scan-knap, to linjer om scope, demo og metode. Rapport: bred statuslinje, dækning, højst tre oversigtskort i første række, derefter sektioner og evidens. Giv plads til »ukendt« og lange danske fejltekster i alle komponenter. Designreview skal bruge complete, partial, failed, tomt og langt indhold — ikke kun den perfekte rapport.
