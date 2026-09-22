export const siteInfo = {
  name: 'WebSpor',
  productTagline: 'Se sporene bag websitet.',
  brandTagline: 'Tænk før du klikker, men klik.',
  author: 'Jacob Witt-Larsen',
  organization: 'Sandboxmodellen',
  websiteUrl: 'https://teknologivejlederen.dk',
  contactEmail: 'jaco227e@lollandskoler.dk',
  githubUrl: 'https://github.com/Ribocarrew/WebSpor',
  version: '1.0.0',
};

export const omPageContent = {
  title: 'Om WebSpor og Sandboxmodellen',
  lead: 'Se på chippen: der er fodspor. Hver gang du besøger en hjemmeside, efterlader du spor. WebSpor viser dem.',
  body: `WebSpor er bygget efter Sandboxmodellens princip: Tænk før du klikker, men klik. Scanneren klikker ikke. Den besøger siden, viser sporene og lader dig tænke. Klikket er dit, bagefter og med viden.`,
  principles: [
    {
      title: 'Passivt engangsbesøg',
      text: 'WebSpor simulerer ét enkelt, anonymt browserbesøg på en offentlig URL. Scanneren klikker aldrig på knapper, udfylder ikke formularer og logger ikke ind.',
    },
    {
      title: 'Evidens før forklaring',
      text: 'Vi viser direkte observationer fra browseren. Vi opdigter aldrig målinger, og ukendte data vises altid som ukendte – aldrig som nul eller sikkert.',
    },
    {
      title: 'Ingen domme eller karakterer',
      text: 'WebSpor giver ikke en samlet "sikkerhedskarakter" eller kalder websites "ulovlige". Vi stiller målbare tekniske data til rådighed for læring og dialog.',
    },
  ],
  licenseNote: `Koden i WebSpor er open source under MIT-licensen. Sandboxmodellens logoer og navnet "Sandboxmodellen" er IKKE omfattet af MIT-licensen. De tilhører Jacob Witt-Larsen og hentes fra npm-pakken @ribocarrew/sandboxmodellen-assets.`,
};

export const privatlivPageContent = {
  title: 'Privatliv og datahåndtering',
  lead: 'WebSpor er bygget med radikal dataminimering som arkitektonisk grundprincip.',
  dataLifecycle: [
    {
      data: 'Indtastet URL',
      storage: 'Kortlivet jobhukommelse under scanningen (højst 3 minutter). Query-parametre og fragmenter afvises ved input.',
      retention: 'Slettes umiddelbart efter scanningen er fuldført.',
    },
    {
      data: 'Rapport og evidens',
      storage: 'Krypteret midlertidigt lager. Adgang kræver en tilfældig 256-bit adgangsnøgle, som kun findes i din browser.',
      retention: 'Slettes automatisk efter 60 minutter. Kan til enhver tid slettes øjeblikkeligt med "Slet rapport"-knappen.',
    },
    {
      data: 'Browserhistorik og indhold',
      storage: 'Ingen rå HTML, skærmbilleder, cookieværdier eller hemmelige tokens gemmes nogensinde.',
      retention: 'Eksisterer udelukkende i flygtig browserhukommelse under scanningen (højst 45 sekunder).',
    },
  ],
  contactText: `Hvis du har spørgsmål til databehandlingen eller projektet, kan du kontakte Jacob Witt-Larsen på:`,
};

export const metodePageContent = {
  title: 'Metode og tekniske rammer',
  lead: 'WebSpor undersøger hvad der sker i en standardbrowser ved et første, passivt besøg på en offentlig webside.',
  sections: [
    {
      heading: '1. Passiv baseline (baseline-v1)',
      text: 'Scanneren åbner den ønskede webadresse i en standardiseret Chromium-browserkontekst (1440×900 viewport, da-DK locale, Europe/Copenhagen tidszone). Der interageres ikke med samtykkebannere (cookiedialoger), der klikkes ikke på links, og der scrolles ikke. Dette viser sidens tekniske grundadfærd for en førstegangsbesøgende.',
    },
    {
      heading: '2. Netværkspolitik og sikkerhed (S-01 til S-05)',
      text: 'For at beskytte både brugeren og målsiden tillades kun HTTP/HTTPS GET og HEAD-forespørgsler. Formularer, POST/PUT/DELETE, WebSockets og WebRTC blokeres før afsendelse. Adressen må ikke være en intern IP-adresse eller et privat netværk. Hver scanning har faste lofter: højst 200 netværkskald, 40 eksterne domæner og 20 MiB data.',
    },
    {
      heading: '3. Første- vs. tredjepart (Public Suffix List)',
      text: 'Vi beregner registrerbare domæner (eTLD+1) ved hjælp af den officielle Public Suffix List (PSL). Henter "skole.dk" ressourcer fra "scripts.skole.dk", er det en førstepart. Henter siden ressourcer fra "andre.com", klassificeres det som en tredjepart.',
    },
    {
      heading: '4. Hvorfor er der ingen samlet sikkerhedskarakter?',
      text: 'Et enkelt sidebesøg kan ikke afsløre, hvordan en virksomhed opbevarer data i deres interne databaser, eller om de overholder alle regler. Derfor giver WebSpor aldrig en karakter fra 0 til 100 eller et grønt/rødt stempel. I stedet viser vi fire konkrete indikatorer (I-01 til I-04) med synlig beregningsformel og dokumenteret usikkerhed.',
    },
  ],
};

export const laerPageContent = {
  title: 'Lær om dataspor på nettet',
  lead: 'Undervisningsmateriale og faglige begreber for 7.–10. klasse, undervisere og borgere.',
  pedagogicalIntro: `WebSpor bygger på princippet: "Tænk før du klikker, men klik." Når du forstår sporene, kan du træffe bevidste valg på nettet.`,
  lessonPlan: {
    duration: '20-minutters hurtig øvelse',
    steps: [
      { step: '1', time: '5 min', title: 'Forudsig', text: 'Vælg en webside. Skriv 3 gæt på papir: Hvor mange eksterne servere henter den indhold fra? Sætter den cookies før du klikker accept?' },
      { step: '2', time: '8 min', title: 'Undersøg', text: 'Undersøg rapporten (eller en demo). Find listen over forbindelser. Er der adresser, I genkender (f.eks. video, skrifttyper eller analyse)?' },
      { step: '3', time: '5 min', title: 'Reflektér', text: 'Find én ting rapporten beviser (en observation), og én ting den IKKE kan sige noget om (en begrænsning).' },
      { step: '4', time: '2 min', title: 'Diskutér', text: 'Hvorfor er det vigtigt at skelne mellem hvad vi VED og hvad vi TROR om et website?' },
    ],
  },
};
