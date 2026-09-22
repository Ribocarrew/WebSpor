export type ExplanationLevel = 'brief' | 'learnMore' | 'technical';

export interface ExplanationEntry {
  brief: string;
  learnMore: string;
  technical: string;
}

export const explanationLevelsMeta: Record<ExplanationLevel, { title: string; audience: string; description: string }> = {
  brief: {
    title: 'Kort fortalt',
    audience: '7.–10. klasse og nysgerrige borgere',
    description: 'Enkel forklaring uden unødig fagjargon.',
  },
  learnMore: {
    title: 'Lær mere',
    audience: 'Undervisere, forældre og interesserede',
    description: 'Didaktisk baggrund: hvad betyder det i praksis, og hvorfor gør websitet sådan?',
  },
  technical: {
    title: 'Teknisk',
    audience: 'Udviklere og IT-professionelle',
    description: 'Præcise tekniske parametre, RFC-standarder og observationskriterier.',
  },
};

export const indicatorExplanations: Record<string, { title: string; unit: string } & ExplanationEntry> = {
  'I-01': {
    title: 'Kontaktede eksterne domæner',
    unit: 'eksterne domæner',
    brief: 'Hvor mange andre servere og tjenester browseren hentede indhold fra under sidebesøget.',
    learnMore: 'Når du åbner en webside, henter browseren ofte billeder, scripts eller skrifttyper fra andre virksomheder (tredjeparter). Hvert eksternt domæne får dit besøg at vide og modtager din computers netværksadresse.',
    technical: 'Antal unikke eTLD+1 domæner med response_received, beregnet mod målets registrerede Public Suffix List (PSL). Forudsætter en fuldført netværkscollector; ellers sættes værdien til null.',
  },
  'I-02': {
    title: 'Gemte cookies',
    unit: 'cookies',
    brief: 'Hvor mange små tekstfiler (cookies) websitet gemte på din enhed under besøget.',
    learnMore: 'Cookies er små datastykker, websitet beder din browser om at huske. Nogle er nødvendige (f.eks. for at holde styr på en indkøbskurv), mens andre bruges til at genkende dig på tværs af sider eller huske dine indstillinger.',
    technical: 'Antal unikke cookies i browserens cookie-jar ved sessionens afslutning. Værdier og stier redigeres væk af dataminimeringshensyn; kun navn, domæne, Secure, HttpOnly, SameSite og levetid registreres.',
  },
  'I-03': {
    title: 'Kildematch (kendte trackere)',
    unit: 'kildematchede domæner',
    brief: 'Hvor mange af de kontaktede tjenester der optræder i godkendte lister over kendte analyse- eller trackingtjenester.',
    learnMore: 'Vi sammenligner de kontaktede adresser med åbne, veldokumenterede lister over analyse- og annoncetjenester. Hvis et domæne ikke matcher, betyder det ikke nødvendigvis, at det er harmløst – kun at det ikke er i listen.',
    technical: 'Antal unikke tredjepartsdomæner, der matcher et aktivt, godkendt og versionsstyret tracker-datasæt. Hvis intet eksternt datasæt er tilknyttet V1, forbliver værdien altid null for at undgå opdigtede målinger.',
  },
  'I-04': {
    title: 'Observerede tekniske beskyttelsessignaler',
    unit: 'ud af 6 kontroller',
    brief: 'Hvor mange af de seks undersøgte tekniske sikkerhedsindstillinger websitet havde slået til på forsiden.',
    learnMore: 'Moderne websites kan sende særlige instrukser (headers) til din browser for at beskytte mod svindel, overvågning og falske kopier. Dette tal viser, hvor mange af seks centrale grundbeskyttelser vi kunne måle. Det er IKKE en samlet sikkerhedskarakter for hele websitet.',
    technical: 'Andel af seks fastlagte HTTP response-headers og transportparametre: HTTPS, HSTS, enforcing CSP, Referrer-Policy, nosniff, frame-protection. Kræver en 2xx HTML-slutrespons og fuldført header- og transportcollector; hvis én kontrol er uafklaret, undertrykkes tallet (null).',
  },
};

export const technicalChecksExplanations: Record<string, { label: string } & ExplanationEntry> = {
  https: {
    label: 'HTTPS-kryptering',
    brief: 'Besøget skete via en krypteret forbindelse (HTTPS), så andre på netværket ikke kan læse med.',
    learnMore: 'HTTPS beskytter mod at uvedkommende på samme netværk (f.eks. et åbent Wi-Fi i toget eller på skolen) kan se præcis hvad du kigger på eller ændre indholdet undervejs.',
    technical: 'Final destination URL anvender scheme "https" med gyldigt certifikat uden certifikatfejl, certifikatbypass eller transportnedgradering.',
  },
  hsts: {
    label: 'HSTS (Strict-Transport-Security)',
    brief: 'Websitet påbyder browseren altid at bruge kryptering ved fremtidige besøg.',
    learnMore: 'HSTS fortæller din browser, at den aldrig nogensinde må åbne siden via usikret HTTP – heller ikke hvis du ved et uheld taster http:// eller klikker på et gammelt link.',
    technical: 'Strict-Transport-Security response header fundet med syntaktisk gyldig max-age > 0 på HTTPS-respons.',
  },
  csp: {
    label: 'CSP (Content-Security-Policy)',
    brief: 'Websitet har regler for, hvilke scripts og ressourcer der må køre på siden.',
    learnMore: 'En indholdssikkerhedspolitik (CSP) beskytter brugere mod skadelig kode (XSS), hvis en hacker skulle forsøge at sprøjte ondsindede scripts ind i siden.',
    technical: 'Ikke-tom, håndhævende Content-Security-Policy header til stede. Content-Security-Policy-Report-Only tæller ikke som håndhævende beskyttelse i I-04.',
  },
  referrerPolicy: {
    label: 'Referrer-Policy',
    brief: 'Websitet begrænser, hvor meget af adressen der sendes videre, når du klikker på links til andre sider.',
    learnMore: 'Når du klikker på et link til en anden hjemmeside, kan den nye side normalt se, hvor du kom fra. En stram Referrer-Policy forhindrer, at personlige oplysninger i adresselinjen lækkes.',
    technical: 'Referrer-Policy har en effektiv sikker standardværdi: no-referrer, same-origin, strict-origin eller strict-origin-when-cross-origin.',
  },
  nosniff: {
    label: 'X-Content-Type-Options',
    brief: 'Forhindrer browseren i at gætte filtyper og køre usikre filer som scripts.',
    learnMore: 'Nogle browsere prøver at gætte, hvad en fil indeholder (MIME-sniffing). Hvis en angriber uploader et ondsindet script forklædt som et billede, blokerer "nosniff" browseren fra at køre det.',
    technical: 'X-Content-Type-Options er sat til den standardiserede værdi "nosniff".',
  },
  frameProtection: {
    label: 'Beskyttelse mod indlejring (Clickjacking)',
    brief: 'Forhindrer andre hjemmesider i at gemme dette website inde i en usynlig ramme for at narre dig.',
    learnMore: 'Clickjacking er et trick, hvor et ondsindet website lægger en usynlig kopi af en rigtig side oven på en knap, du trykker på, så du uforvarende klikker på noget andet.',
    technical: 'Gyldig håndhævende CSP med "frame-ancestors" uden wildcard (*), eller gyldig X-Frame-Options sat til DENY eller SAMEORIGIN (med hensyntagen til CSP-præcedens).',
  },
};

export const collectorExplanations: Record<string, { title: string } & ExplanationEntry> = {
  network: {
    title: 'Netværksforbindelser',
    brief: 'Overvåger alle HTTP/HTTPS-forespørgsler og svar under sidevisningen.',
    learnMore: 'Registrerer hvilke eksterne servere siden henter filer fra. Kun GET- og HEAD-kald tillades for at undgå formularafsendelser og utilsigtede serverændringer.',
    technical: 'Registrerer request_attempt, request_blocked og response_received med relative tidsstempler. Egressgateway begrænser til max 200 requests og 40 unikke origins.',
  },
  cookies: {
    title: 'Cookies',
    brief: 'Undersøger hvilke cookies browseren modtog og gemte under besøget.',
    learnMore: 'Måler både forsøg på at sætte cookies og hvilke der rent faktisk endte i browserens lager efter sideindlæsningen. Værdier gemmes aldrig.',
    technical: 'Inspektion af browserens cookie-jar. Data minimeres ved kun at bevare navn, domæne, Secure, HttpOnly, SameSite og levetidskategori (session vs persistent).',
  },
  storage: {
    title: 'Lokal browserlagring',
    brief: 'Måler om websitet bruger localStorage eller sessionStorage på din enhed.',
    learnMore: 'Websites kan gemme data direkte i din browser uden at bruge cookies. Vi tæller antallet af poster uden at aflæse selve indholdet.',
    technical: 'Tæller poster i localStorage, sessionStorage og indexedDB for tilgængelige same-origin frames. Værdier og nøgler kasseres af hensyn til privatliv.',
  },
  headers: {
    title: 'Sikkerhedsheadere',
    brief: 'Læser de tekniske sikkerhedsinstrukser, webserveren sendte sammen med websiden.',
    learnMore: 'HTTP-headers er metadata mellem server og browser. Vi kontrollerer de centrale instruktioner, der beskytter brugere mod angreb.',
    technical: 'Deterministisk parsing af response headers fra den endelige 2xx HTML-respons (HSTS, CSP, Referrer-Policy, X-Content-Type-Options, X-Frame-Options).',
  },
  transport: {
    title: 'Transport og kryptering',
    brief: 'Tjekker om forbindelsen er krypteret med HTTPS uden certifikatfejl.',
    learnMore: 'Kontrollerer at forbindelsen til serveren er etableret sikkert og at der ikke skete en usikret omdirigering til ukrypteret HTTP.',
    technical: 'Undersøger TLS-status på final transport URL, certifikatets gyldighed og fravær af nedgradering (HTTP/HTTPS mix).',
  },
};

export const failureCodeMessages: Record<string, { title: string; message: string; action: string }> = {
  INVALID_TARGET: {
    title: 'Ugyldig webadresse',
    message: 'Den indtastede adresse kunne ikke genkendes som en gyldig offentlig webadresse.',
    action: 'Indtast et almindeligt domænenavn som f.eks. "example.com" uden personlige parametre.',
  },
  TARGET_DISALLOWED: {
    title: 'Målet kan ikke undersøges',
    message: 'Adressen peger på et internt netværk, en IP-adresse eller et beskyttet område, som scanneren af sikkerhedsårsager ikke må tilgå.',
    action: 'WebSpor kan kun undersøge offentligt tilgængelige websites over HTTP/HTTPS.',
  },
  RATE_LIMITED: {
    title: 'For mange forsøg',
    message: 'Du eller dit netværk har nået grænsen for antal undersøgelser inden for det seneste tidsrum.',
    action: 'Vent venligst det anviste antal sekunder, eller prøv vores fiktive demo.',
  },
  QUEUE_FULL: {
    title: 'Scanneren er optaget',
    message: 'Der er i øjeblikket for mange igangværende undersøgelser i køen.',
    action: 'Prøv igen om et øjeblik, eller se demonstrationsrapporten.',
  },
  QUEUE_EXPIRED: {
    title: 'Undersøgelsen nåede ikke at starte',
    message: 'Jobbet ventede for længe i køen og blev afbrudt for at skåne serverressourcerne.',
    action: 'Prøv igen senere.',
  },
  DNS_FAILED: {
    title: 'Adressen kunne ikke findes',
    message: 'Webserveren kunne ikke slås op i DNS. Domænet eksisterer muligvis ikke eller er midlertidigt nede.',
    action: 'Kontrollér stavningen af domænet.',
  },
  TLS_FAILED: {
    title: 'Sikker forbindelse fejlede',
    message: 'Der kunne ikke oprettes en gyldig HTTPS-krypteret forbindelse til websitet.',
    action: 'WebSpor omgår ikke certifikatfejl af sikkerhedshensyn.',
  },
  ACCESS_BLOCKED: {
    title: 'Adgang blokeret af websitet',
    message: 'Websitet afviste scannerens anonyme sidebesøg (f.eks. via en firewall, loginvæg eller CAPTCHA).',
    action: 'WebSpor omgår ikke adgangskontroller eller login.',
  },
  REDIRECT_LIMIT: {
    title: 'For mange viderestillinger',
    message: 'Siden viderestillede mere end fem gange uden at nå en stabil slutdestination.',
    action: 'Undersøgelsen stoppede for at undgå uendelige omdirigeringsløkker.',
  },
  NAVIGATION_TIMEOUT: {
    title: 'Besøget tog for lang tid',
    message: 'Siden svarede ikke inden for tidsfristen (15 sekunders DOM-indlæsning).',
    action: 'Hjemmesiden er muligvis meget langsom eller utilgængelig.',
  },
  RESOURCE_LIMIT: {
    title: 'Ressourcegrænse nået',
    message: 'Siden genererede for mange netværkskald eller overskred dataloftet (200 kald / 20 MiB).',
    action: 'Observationer indtil grænsen er bevaret som delvis rapport.',
  },
  COLLECTOR_FAILED: {
    title: 'Delvis måling fejlede',
    message: 'En eller flere af undersøgelserne kunne ikke gennemføres.',
    action: 'Øvrige valide observationer vises i rapporten med angivelse af begrænsningen.',
  },
  WORKER_CRASH: {
    title: 'Scanneren stoppede uventet',
    message: 'Browserprocessen lukkede ned under besøget.',
    action: 'Kun allerede valideret evidens er bevaret.',
  },
  SCHEMA_INVALID: {
    title: 'Ugyldigt resultat',
    message: 'Scannerens interne output levede ikke op til kvalitetskravene.',
    action: 'WebSpor viser aldrig opdigtede eller ufuldstændige målinger som succes.',
  },
  CANCELLED: {
    title: 'Undersøgelsen er afbrudt',
    message: 'Du har stoppet undersøgelsen, og alle midlertidige data er slettet.',
    action: 'Du kan starte en ny undersøgelse fra forsiden.',
  },
  RESULT_EXPIRED: {
    title: 'Rapporten er udløbet',
    message: 'Rapporter slettes automatisk efter 60 minutter af hensyn til dit privatliv.',
    action: 'Start en ny undersøgelse, hvis du ønsker et opdateret øjebliksbillede.',
  },
};
