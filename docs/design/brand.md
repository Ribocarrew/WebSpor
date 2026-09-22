# Brand, logo og afsender

Dette dokument er bindende. Følg det præcist. Afvig ikke, og
find ikke på alternativer. Ved konflikt med andre dokumenter
om logo, farver, typografi eller afsender gælder dette dokument.

## Afsender

WebSpor er et værktøj fra Sandboxmodellen af Jacob Witt-Larsen.
Sandboxmodellens website er https://teknologivejlederen.dk.

Kontakt: [jaco227e@lollandskoler.dk](mailto:jaco227e@lollandskoler.dk).
Adressen er valgt af Jacob Witt-Larsen. Opfind ingen anden e-mail,
telefon eller kontaktformular. Se ADR-015.

## To taglines med hver sin rolle

| Tagline | Rolle | Placering |
|---|---|---|
| Se sporene bag websitet. | WebSpors produkttagline | Forsiden under navnet, README |
| Tænk før du klikker, men klik. | Sandboxmodellens afsendertagline | Footer på alle sider, /om |

Begge skrives præcis som her, med stort begyndelsesbogstav,
komma og punktum. De må ikke ændres, forkortes, oversættes
eller byttes om.

## Logo

### Kilde

Logoerne hentes KUN fra npm-pakken:

    @ribocarrew/sandboxmodellen-assets@1.0.0

Hent ikke logoer fra GitHub, Google Drive, en CDN eller nogen
anden kilde. Generér, tegn eller opfind aldrig et logo, en SVG
eller en placeholder.

### Valgte logoer

WebSpor bruger præcis to af pakkens seks logoer:

| Konstant | Bruges til | Begrundelse |
|---|---|---|
| LOGO_SIMPELT | Header og /om | Viser fodspor på chippen = dataspor. Hovedlogo. |
| LOGO_MINIMALT | Favicon, apple-touch-icon, footer | Det eneste logo, der kan læses i 32 px. |

Brug IKKE LOGO_DETALJERET eller nogen af HANDSON-varianterne.

### Egenskaber ved pakken

- Pakken er CommonJS og eksporterer FILSTIER på disken, ikke
  URL'er. Den må kun bruges i build-scriptet, aldrig i
  frontend-koden.
- Originalerne er 3762×3762 px og 4–9 MB. De må aldrig bruges
  direkte. De skaleres og konverteres i build-scriptet.
- Originalfilnavnene indeholder mellemrum og "å". Output-filerne
  får de simple navne, der står nedenfor.
- Pakken er UNLICENSED. Logoerne er ikke omfattet af WebSpors
  MIT-licens. Se afsnittet Licens.

### Installation

    npm install @ribocarrew/sandboxmodellen-assets@1.0.0
    npm install --save-dev sharp

Versionen låses til præcis 1.0.0 i package.json (ingen ^ eller ~).

### Build-script

Opret `scripts/brand-assets.mjs` med præcis dette indhold:

    import { createRequire } from 'node:module';
    import { mkdir } from 'node:fs/promises';
    import sharp from 'sharp';

    const require = createRequire(import.meta.url);
    const logos = require('@ribocarrew/sandboxmodellen-assets');
    const OUT = 'public/brand';

    const jobs = [
      // Hovedlogo med fodspor (2x opløsning til skarpe skærme)
      { src: logos.LOGO_SIMPELT,  name: 'logo-header', width: 112 },
      { src: logos.LOGO_SIMPELT,  name: 'logo-om',     width: 480 },
      // Minimalt logo til små størrelser
      { src: logos.LOGO_MINIMALT, name: 'logo-footer', width: 96 },
      { src: logos.LOGO_MINIMALT, name: 'favicon-32',       width: 32,  png: true },
      { src: logos.LOGO_MINIMALT, name: 'apple-touch-icon', width: 180, png: true },
    ];

    await mkdir(OUT, { recursive: true });
    for (const j of jobs) {
      const img = sharp(j.src).resize({ width: j.width });
      if (j.png) {
        await img.png({ compressionLevel: 9 }).toFile(`${OUT}/${j.name}.png`);
      } else {
        await img.clone().webp({ quality: 85 }).toFile(`${OUT}/${j.name}.webp`);
        await img.clone().png({ compressionLevel: 9 }).toFile(`${OUT}/${j.name}.png`);
      }
    }
    console.log('Brand-assets skrevet til', OUT);

Tilføj i package.json:

    "scripts": {
      "prebuild": "node scripts/brand-assets.mjs"
    }

npm kører `prebuild` automatisk før `build`, også når Netlify
bygger fra GitHub.

Tilføj i .gitignore:

    public/brand/

Hvis scriptet fejler, skal buildet fejle. Fang aldrig fejlen
og fortsæt uden logo.

### Placering og størrelser

| Sted | Fil | Visningsstørrelse |
|---|---|---|
| Header | logo-header | 56×56 px desktop, 44×44 px mobil |
| /om | logo-om | 240×240 px |
| Footer | logo-footer | 48×48 px |
| Browserfane | favicon-32.png | 32×32 px |
| Mobil-genvej | apple-touch-icon.png | 180×180 px |

Logoet placeres altid på #F5F5F4 eller #FFFFFF. Aldrig på
teal, amber eller et foto.

### HTML

Header (logo + navnet WebSpor, linker til forsiden):

    <a href="/" class="brand">
      <picture>
        <source srcset="/brand/logo-header.webp" type="image/webp">
        <img src="/brand/logo-header.png" alt="" width="56" height="56">
      </picture>
      <span class="brand-name">WebSpor</span>
    </a>

Logoet har `alt=""`, fordi teksten "WebSpor" står ved siden af,
og linket dermed allerede har et navn.

Footer (tilføjes over de eksisterende footer-links fra
information-architecture.md):

    <footer class="site-footer">
      <img src="/brand/logo-footer.webp" alt="" width="48" height="48">
      <p class="tagline">Tænk før du klikker, men klik.</p>
      <p>Et værktøj fra Sandboxmodellen ·
         <a href="https://teknologivejlederen.dk">teknologivejlederen.dk</a></p>
      <!-- Eksisterende links: Privatliv · GitHub · version · kontakt -->
    </footer>

/om (øverst på siden):

    <picture>
      <source srcset="/brand/logo-om.webp" type="image/webp">
      <img src="/brand/logo-om.png"
           alt="Sandboxmodellens logo: en computerchip med fodspor"
           width="240" height="240">
    </picture>

Tekst lige under logoet på /om:

    Se på chippen: der er fodspor. Hver gang du besøger en
    hjemmeside, efterlader du spor. WebSpor viser dem.

    WebSpor er bygget efter Sandboxmodellens princip:
    Tænk før du klikker, men klik. Scanneren klikker ikke.
    Den besøger siden, viser sporene og lader dig tænke.
    Klikket er dit, bagefter og med viden.

Favicon (i `<head>` på alle sider):

    <link rel="icon" href="/brand/favicon-32.png" sizes="32x32">
    <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">

Alle `<img>` skal have `width` og `height`.

### Forbudt

- Direkte links til logoer på eksterne domæner. Det sender
  brugerens IP-adresse til en tredjepart.
- Commit af originalfilerne eller af `public/brand/`.
- Brug af originalfilerne direkte i HTML.
- Omfarvning, beskæring, rotation, skygge, filter eller
  animation af logoet.
- Selvgenererede logoer, SVG-genskabelser eller placeholders.
- Andre logovarianter end de to ovenfor.

## Typografi

Fonte selvhostes via npm. Ingen kald til Google Fonts eller
andre eksterne fontservere.

    npm install @fontsource/inter@5.3.0 @fontsource/jetbrains-mono@5.3.0

| Font | Bruges til | Vægte |
|---|---|---|
| Inter | Overskrifter og brødtekst | 400, 500, 600, 700 |
| JetBrains Mono | Tekniske værdier, domæner, headers, kode | 400, 500 |

Importér kun de vægte, der står i tabellen, og kun latin-subset.

Fallback-stakke:

    --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Consolas, monospace;

Brug `font-display: swap`.

## Licens

Tilføj dette afsnit sidst i README.md:

    ## Licens

    Koden i WebSpor er udgivet under MIT-licensen (se LICENSE).

    Sandboxmodellens logoer og navnet "Sandboxmodellen" er IKKE
    omfattet af MIT-licensen. De tilhører Jacob Witt-Larsen og
    hentes fra npm-pakken @ribocarrew/sandboxmodellen-assets.
    Forker du projektet, skal du fjerne eller erstatte logoerne.

## Accepttest (R-12)

- [ ] package.json har `@ribocarrew/sandboxmodellen-assets`
      låst til `1.0.0`
- [ ] `npm run build` genererer alle filer i `public/brand/`
- [ ] Buildet fejler, hvis pakken mangler
- [ ] `public/brand/` står i .gitignore
- [ ] logo-header.webp er under 15 KB
- [ ] Browserens netværksfane viser nul eksterne kald for
      logo, favicon og fonte
- [ ] Alle `<img>` har `width`, `height` og korrekt `alt`
- [ ] Begge taglines står præcis som angivet og på de rigtige
      steder
- [ ] Farverne matcher tokens i design-system.md
- [ ] Licensafsnittet står i README.md
