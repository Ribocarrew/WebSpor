# Scoring, indikatorer og måledækning

## Beslutning

V1 har **ingen samlet sikkerheds-, privatlivs- eller troværdighedsscore**. Et enkelt passivt besøg kan ikke bære en sådan dom. V1 leverer gennemsigtige tællinger og en snæver teknisk indikator med udskrevet formel. Det er en produktbeslutning, ikke manglende implementation.

## Dækning

Vis status for hver af de fem collectors. `coverage = antal complete collectors / 5`, vist som »3 af 5 undersøgelser fuldført«. Vis ikke dækningsprocent som sikkerhed. Partial tæller ikke som complete. Politisk blokerede metoder, ingen samtykkeklik og én browserregion skal stå ved siden af dækningen, selv hvis alle collectors er complete.

## Indikatorer

| ID | Beregning | Kræver | Manglende data |
|---|---|---|---|
| I-01 Kontaktede eksterne domæner | Antal unikke registrerbare tredjepartsdomæner med `response_received` | Complete network, final origin, PSL | null; observerede deldata kan listes uden totalpåstand |
| I-02 Gemte cookies | Antal unikke cookies i slutsnapshot; intern identitet følger browserens cookieidentitet før path fjernes | Complete cookies | null |
| I-03 Kildematch | Antal unikke kontaktede tredjepartsdomæner med entydigt godkendt tracker/analytics-match | I-01 og gyldigt datasæt | null; aldrig automatisk 0 |
| I-04 Tekniske signaler | `100 × sum(bestået) / 6`, afrundet til heltal | Complete headers og transport; alle seks kontroller vurderbare | null |

I-04 hedder »Observerede tekniske beskyttelsessignaler«, aldrig »sikkerhed«. Vis altid både `x af 6` og de enkelte kriterier. Ingen farvebaseret risikokategori og ingen vægtning efter domæne. Hvis en kontrol er ukendt, undertryk tallet frem for at reducere nævneren. I-01/I-02/I-03 er tællinger, ikke risiko-skalaer.

I-04 kræver desuden en final 2xx HTML-response, som ikke er identificeret som adgangs-/loginvæg. Ved anden indholdstype, HTTP-fejl eller utilstrækkeligt vurderbart indhold er værdien null. Headerfund kan stadig vises med den faktiske response-status.

## Seks kontroller i I-04

1. Final side hentet over HTTPS uden browserens certifikatfejl og uden nedgradering.
2. HSTS på final HTTPS-response med gyldig `max-age > 0`.
3. En ikke-tom, syntaktisk gyldig håndhævende Content-Security-Policy-header. Report-Only tæller ikke. Indikatoren siger kun tilstedeværelse, ikke kvalitet.
4. Referrer-Policy med effektiv værdi `no-referrer`, `same-origin`, `strict-origin` eller `strict-origin-when-cross-origin`.
5. X-Content-Type-Options med gyldig `nosniff`.
6. Gyldig håndhævende CSP `frame-ancestors` uden `*`, eller effektiv X-Frame-Options `DENY`/`SAMEORIGIN`. Ved CSP-præcedens tæller et tilsidesat XFO ikke.

Deterministisk parser skal håndtere gentagne headers og standardens effektive værdi. Kan det ikke afgøres entydigt, er kontrollen unknown. Ugyldig kendt syntaks er fail, ikke »sårbar«. Manglende header ved fuldført collector er fail for tilstedeværelseskontrollen. Meta-CSP tæller ikke i denne response-headerindikator. Ingen vurdering af serverens øvrige sider, afhængigheder eller alle CSP-direktivers beskyttelsesværdi.

## Regneeksempler og stabilitet

Syntetisk rapport: alle seks vurderbare, fire består → 67 og »4 af 6«. Fem består og én unknown → null, »En kontrol kunne ikke vurderes«. Headercollector fejler → null. Complete cookies med nul gemte → 0; partial cookies med to sete → indikator null og liste med »mindst 2 observeret«.

Samme redigerede artefakt og regelversion skal give identiske resultater. Nyt live-scan kan afvige. Udviklingssammenligninger kræver samme metode, profil og datasæt. Enhver ændring af formel, parserbetydning eller kriterier kræver ny rulesetVersion og regressionstest.
