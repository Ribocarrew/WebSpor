# Scan engine

Normativ V1-profil: `baseline-v1`. Se [sikkerhed](../architecture/security.md), [evidens](evidence-classification.md) og [fejl](failure-states.md). Alle grænser er projektets konservative startvalg, ikke browserens kapacitetsgrænser. Ændringer kræver profilversion og belastningstest.

## Jobforløb

`queued → validating → running → processing → completed | partial | failed`. `cancelled` kan nås fra alle ikke-terminale tilstande. Kun kontrolplanet må ændre status; terminalt resultat er uforanderligt. Et udløbet job får API-status 410, uanset tidligere slutstatus.

1. API normaliserer og validerer mål, kvoter og idempotens. Accepter kun offentlige HTTP(S)-URL'er uden credentials, query eller fragment; path tillades, men må ikke gemmes i rapporten. Afvis IP-literals og specialnavne. Ingen automatisk HTTP-fallback efter HTTPS-fejl.
2. Worker gentager validering og opretter en ny isoleret jobinstans med Chromium-sandbox, frisk context og tom cookie/storage. Ingen genbrug af browserprocesser mellem jobs.
3. Installér events og request-policy før navigation. Slå service workers, downloads, popups, WebSockets, WebRTC og browserpermissions fra. Ingen extensions, proxyvalg eller headers fra brugeren.
4. Besøg præcis input-URL. Tillad højst fem top-level redirects, hvert hop valideres. Ingen rekursiv crawling. Cross-origin redirect kan accepteres efter samme sikkerhedskontrol og vises som målændring. HTTPS→HTTP afvises.
5. Navigér med højst 15 sekunders ventetid på DOMContentLoaded; observer derefter i 8 sekunder. Ingen `networkidle` som sandhed om færdig side. Samlet browserfase højst 30 sekunder; ved grænse bevares kun gyldige observationer som delvise.
6. Saml final-response headers, netværkshændelser, gemte cookie-attributter og storage-antal i tilgængelige frames. Ingen rå HTML, tekstindhold, screenshots, payloads eller værdier gemmes.
7. Stop browser, redigér/validér output, kør deterministiske regler, beregn kun tilladte indikatorer. Kontrolplanet validerer worker-output igen. Slet midlertidig disk og afslut instans også ved fejl.

Final HTML-response skal være en vellykket 2xx-side for at udløse den tekniske indikator. Fejlsider, loginvægge og adgangsblokeringer må ikke fremstå som vurdering af den ønskede side. Client-side top-level navigation og enhver formularnavigation blokeres; kun HTTP-redirectkæden fra den oprindelige navigation tillades. Dokumentér, at dette kan afbryde JavaScript-baseret viderestilling.

## Browserprofil

Desktop viewport 1440×900, locale `da-DK`, timezone `Europe/Copenhagen`, faktisk EU-egressregion registreres. User agent må ikke foregive at være en elev; dokumentér faktisk Chromium-version og scanneridentifikation. Ingen geolocation-permission. Browseren vil naturligt eksponere scannerens IP og profil til målsiden; rapporten gælder denne profil. Ingen stealth eller CAPTCHA-løsning.

## Netværkspolitik

Kun GET/HEAD er tilladt mod målsiden og dens subressourcer. POST, PUT, PATCH, DELETE, OPTIONS, beacons med andre metoder og formularnavigation blokeres før afsendelse. Et GET kan stadig give servereffekter; derfor ingen klik, automatiske formularer, genbesøg eller brugerdefinerede requests. Denne konservative politik reducerer observerbar tracking, især POST-baseret analyse. Vis begrænsningen fast; blokerede forsøg er ikke bevis for delte data.

HTTPS-redirects og subressourcer kan indeholde query fra selve siden. De følger netværkspolitikken, men path/query/fragment og credentials må aldrig ende i logs, rapport eller AI-input. Browserkontekst og nødvendige requestdata eksisterer kun midlertidigt under jobbet.

| Grænse | V1-værdi | Ved overskridelse |
|---|---|---|
| HTTP-requests | 200 pr. job inkl. redirects | Stop netværk; partial |
| Unikke destination-origins | 40 | Stop nye forbindelser; partial |
| Samlet ingress | 20 MiB håndhævet ved egressgateway | Afbryd; partial |
| Én response | 5 MiB | Afbryd stream; partial |
| Top-level redirects | 5 | Stop navigation; partial/failed |
| Worker-vægur inkl. processing | 45 sekunder | Supervisor dræber job; partial hvis validerbart output |
| CPU/RAM | 1 vCPU, 1 GiB pr. job | Hard kill; failed eller partial |
| Rapportstørrelse | 1 MiB redigeret JSON | Trim events med dropped-count; partial |

Bytegrænser SKAL håndhæves af gateway/streaminglag, ikke ved at læse hele body efter download. Hvis infrastrukturen ikke kan håndhæve dem, er live-scan blokeret. Headerindsamling kræver gennemtestet gatewaydesign; browserens flags alene er ikke en sikkerhedsgrænse.

## Collectors og ærlighed

Fem collectors: `network`, `cookies`, `storage`, `headers`, `transport`. Status `complete | partial | failed | not_run` med reason, start/slut og eventuel dropped-count. Complete betyder fuldført inden for den dokumenterede profil, ikke komplet indsigt i websitet. Policyblokerede trafiktyper står separat i coverage. Cross-origin storage, som ikke kan læses, er partial; det må ikke antages tomt.

Cookieindsamling læser browserens faktisk gemte cookies; response-Set-Cookie er særskilt forsøgsobservation. Bevar kun navn efter begrænset validering/redigering, domain, Secure, HttpOnly, SameSite og levetidskategori; ingen value eller cookie-path. Storage: kun mekanisme, origin og antal; ingen keys eller values. Fingerprinting og keylogging undersøges ikke i V1.
