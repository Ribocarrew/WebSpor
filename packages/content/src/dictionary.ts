export interface DictionaryTerm {
  term: string;
  category: 'netvaerk' | 'cookies_storage' | 'sikkerhed' | 'metode';
  definition: string;
  example: string;
  limitation: string;
}

export const dictionaryTerms: DictionaryTerm[] = [
  {
    term: 'Førstepart',
    category: 'netvaerk',
    definition: 'Det website og domæne, du aktivt har valgt at besøge (den adresse, der står i browserens adresselinje).',
    example: 'Hvis du besøger "skole.example", er "skole.example" førsteparten.',
    limitation: 'To forskellige adresser ejet af samme selskab regnes teknisk set som forskellige domæner.',
  },
  {
    term: 'Tredjepart',
    category: 'netvaerk',
    definition: 'En ekstern server eller virksomhed, som førsteparten henter indhold, scripts eller skrifttyper fra.',
    example: 'Hvis "skole.example" henter et kort fra "kort.example", er "kort.example" en tredjepart.',
    limitation: 'En forbindelse til en tredjepart betyder ikke automatisk overvågning eller ulovlighed; det kan være nødvendig teknisk drift.',
  },
  {
    term: 'Cookie',
    category: 'cookies_storage',
    definition: 'En lille tekstfil, som et website beder din browser om at gemme på din enhed for at kunne genkende den senere.',
    example: 'En session-cookie, der husker hvilket sprog du har valgt på siden.',
    limitation: 'WebSpor aflæser aldrig værdien i cookien, kun dens navn og tekniske egenskaber (Secure, HttpOnly, levetid).',
  },
  {
    term: 'Lokal lagring (localStorage)',
    category: 'cookies_storage',
    definition: 'Et lager i browseren, hvor websites kan gemme mere data end i cookies, og uden at dataene automatisk sendes med i alle netværkskald.',
    example: 'Gemme en kladde til en tekst eller brugerens præference for mørkt tema.',
    limitation: 'WebSpor kan kun tælle antallet af gemte poster og læser aldrig det gemte indhold.',
  },
  {
    term: 'HTTPS og TLS',
    category: 'sikkerhed',
    definition: 'Kryptering af forbindelsen mellem din browser og webserveren, så uvedkommende ikke kan aflytte eller ændre data undervejs.',
    example: 'Hængelåsen i browserens adressefelt.',
    limitation: 'HTTPS beskytter transporten over nettet, men garanterer ikke at virksomheden bag siden opbevarer dine data sikkert på deres servere.',
  },
  {
    term: 'HSTS (Strict-Transport-Security)',
    category: 'sikkerhed',
    definition: 'En instruks til browseren om altid at bruge HTTPS fremover, selv hvis brugeren ved en fejl taster http://.',
    example: 'Serveren sender "Strict-Transport-Security: max-age=31536000".',
    limitation: 'Beskytter kun hvis browseren mindst én gang tidligere har modtaget instruksen eller siden er på en preload-liste.',
  },
  {
    term: 'Content-Security-Policy (CSP)',
    category: 'sikkerhed',
    definition: 'Regler fra serveren, der bestemmer hvilke kilder der må levere scripts, billeder og stilarter til websiden.',
    example: 'En regel der forbyder scripts fra ukendte domæner for at forhindre hacker-angreb (XSS).',
    limitation: 'Indikatoren måler kun om en håndhævende CSP er til stede, ikke hvor effektivt eller stramt regelsættet er opsat.',
  },
  {
    term: 'Evidens og ukendt',
    category: 'metode',
    definition: 'WebSpor adskiller direkte målinger (observationer) fra fortolkninger. Manglende information vises som "ukendt", aldrig som nul eller sikkert.',
    example: 'Hvis en tracker-liste ikke kender et domæne, er formålet "ukendt" – ikke "garanteret harmløst".',
    limitation: 'Et enkelt passivt sidebesøg kan kun vise synlige tekniske spor, ikke interne databaser eller efterfølgende datadeling.',
  },
];
