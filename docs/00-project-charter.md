# Projektgrundlag

Version 1.0 · 2026-09-22 · Accepteret byggegrundlag; ikke implementeret produkt.

WebSpor hjælper mennesker med at undersøge synlige dataspor fra ét afgrænset sidebesøg. Produktet viser observation, klassifikation og usikkerhed. Det kan ikke se websites interne databaser, efterfølgende videresalg eller brugerens personlige browserhistorik.

| ID | Ufravigeligt krav |
|---|---|
| P-01 | Offentlig open source; eksisterende MIT-licens bevares. |
| P-02 | Dansk først, engelsk senere. 7.-10. klasse primært; privatpersoner og professionelle bruger samme evidens. |
| P-03 | Desktop-first, fuldt responsiv, inklusive 320 CSS-pixels og tastatur. |
| P-04 | Ingen login. Ét anonymt offentligt sidebesøg pr. scan uden interaktion. |
| P-05 | Ingen pentest, formularafsendelse, køb, login, CAPTCHA- eller adgangsomgåelse. |
| P-06 | Ingen hardcodede domænevurderinger; samme observationer giver samme resultat uanset domæne. |
| P-07 | Evidens → deterministisk klassifikation → forklaring. AI må ikke måle, score, klassificere eller dømme. |
| P-08 | No result is better than a fabricated result. Ukendt er aldrig nul eller sikkert. |
| P-09 | GitHub → Netlify frontend; separat isoleret Playwright/Chromium-service. |
| P-10 | DK/EU, dataminimering, efterprøvelig metode; ingen automatisk juridisk compliancevurdering. |

SKAL er releaseblokerende. BØR kræver begrundet afvigelse. KAN er valgfrit. Dokumenterne beskriver målkrav, medmindre verificeret implementation er angivet.

Ved konflikt: grundlag → sikkerhed/privacy/AI → evidens/API → features → design → roadmap. Registrér konflikten i [decision log](decisions/decision-log.md), og opdater dokumenterne samlet ved ny beslutning.

V1 er passiv baseline uden samtykkeklik. Scannerens filtre ændrer sideadfærd, hvilket rapporten skal vise. Aktiv fingerprinting-detektion, samtykkesammenligning, crawler, historik, fælles rapportlinks, PDF og AI-chat er senere arbejde. Vis dem som ikke undersøgt, aldrig som beståede kontroller. Se [features](product/feature-specification.md). Driftsleverandør, budget, privat kontaktvej og databehandlingsgrundlag skal lukkes før offentlig scanning.
