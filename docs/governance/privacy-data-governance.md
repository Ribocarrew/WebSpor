# Privacy og data governance

WebSpor undersøger anonyme offentlige sidebesøg, men tjenesten er ikke dermed uden persondatabehandling. IP-adresser, inputlinks og tekniske logs kan indeholde personoplysninger. Projektets valg nedenfor er dataminimeringskrav, ikke en juridisk godkendelse. Grundprincipper er beskrevet af [Datatilsynet](https://www.datatilsynet.dk/regler-og-vejledning/grundlaeggende-begreber/hvad-er-dine-forpligtelser/de-grundlaeggende-principper); faktisk behandlingsgrundlag og leverandørforhold afklares før release.

## Datalivscyklus

| Data | Formål/sted | Maksimal levetid | Adgang |
|---|---|---|---|
| Indsendt fuld URL uden query/fragment | Krypteret jobkø og workerhukommelse | Til job afsluttes, højst 3 minutter fra oprettelse | Admission/supervisor og eget job |
| Browserdata, cookie-værdier, sideindhold | Flygtig jobinstans; ingen persistent logs/dumps | Jobliv, højst 45 sekunder i worker; oprydning højst 60 sekunder efter stop | Worker |
| Redigeret rapport og tokenhash | Krypteret EU-lager | 60 minutter fra oprettelse | Kontrolplan, tokenindehaver |
| Krypteret idempotensresponse inkl. token | Retries uden dobbeltscan | 10 minutter; aldrig efter sletning | Admission |
| Kvotenøgler (roteret IP-HMAC) | Misbrugsbegrænsning | Højst 24 timer; separat nøgle pr. døgn | Admission |
| Tombstone med tokenhash | Idempotent sletning/udløbsbesked | 10 minutter efter sletning/udløb | API |
| Redigerede driftslogs | Fejl og sikkerhed | 7 dage | Navngivne operatører |
| Aggregerede tællinger uden mål/IP/job-ID | Kapacitetsplan | 30 dage | Operatører |

IP-HMAC er pseudonymisering, ikke anonymisering. Ingen langsigtet hashhistorik eller kobling til scannede mål. Begrænsning pr. døgn nulstilles ved nøglerotation; globalt budget modvirker misbrug omkring døgnskift. Rå IP kan være synlig i reverse proxy/hosting: disable/redigér adgangslogs, dokumentér leverandørens egen opbevaring, og offentliggør de faktiske vilkår før release.

## Minimering ved indsamling

Query/fragment og URL-credentials afvises ved input. Paths kan stadig være personlige: vis inputadvarsel, gem aldrig path i rapport/log, og brug ingen historik. Redirect- og subressource-URL'er redigeres til origin før evidenslagring. Ingen rå HTML, HAR, trace, screenshot, payload, storage keys/values, cookie values eller authorization-headers. Cookie-navne kan indeholde identifikatorer: valider længde/tegn og redigér højentropiske eller personlignende værdier; ved tvivl vis anonym lokal reference. Ingen redaktionslog med originalværdien.

## Brugerrettigheder og sletning

Slet-knappen stopper jobbet og fjerner rapport, token og idempotensentry inden 60 sekunder. Udløbet sletter automatisk. Ingen rapportbackups. Kortlivsdata må ikke dukke op igen ved rollback eller restore. Tests skal kontrollere kø, lager, logs og crash dumps. Ved tabt token kan operatøren ikke genskabe rapportadgang; undgå at indsamle identitet for at løse det. Kontaktvej for rettigheder offentliggøres før pilot.

## Organisatoriske releasekrav

Navngiv dataansvarlig, kontakt og operatør. Kortlæg Netlify, API-hosting, DNS/egress, lager, monitoring og eventuel AI som faktiske leverandører med geografier, databehandleraftaler, underdatabehandlere og eventuelle overførsler. EU-region alene er ikke fuld compliance. Dokumentér formål og behandlingsgrundlag, og vurder behovet for konsekvensanalyse med særlig opmærksomhed på elever. Ingen elevkonti, navne, skole-ID, reklamer eller adfærdstracking i V1.

Frontend anvender selvhostede assets/fonts og ingen analytics som default. Nødvendig browserhukommelse til token forsvinder ved reload. Eksterne scripts/cookieværktøjer kræver særskilt vurdering. Privatlivsteksten skal beskrive det faktisk deployede system; en skabelon må ikke offentliggøres som udfyldt politik.

AI er slået fra som standard. Før aktivering: dokumentér leverandør, retention/træningsvilkår og databehandling; send kun allowlistet struktureret evidens. Ingen domæner eller identificerbare data er nødvendige for de generiske forklaringer.
