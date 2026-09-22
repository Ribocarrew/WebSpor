# Primærkilder og metodeafgrænsning

Kontrolleret 2026-09-22. Kilder underbygger tekniske og organisatoriske principper; WebSpors grænser, tal, arkitektur og indikatorer er projektvalg. De udgør ikke certificering eller juridisk rådgivning. Genkontrollér versionsfølsomme kilder ved implementation og release.

| Kilde | Brug i pakken | Afgrænsning |
|---|---|---|
| [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) | URL/IP-validering, A/AAAA og DNS-rebinding som centrale trusler | Erstatter ikke test af faktisk egress |
| [Playwright Docker](https://playwright.dev/docs/docker) | Browserisolation, non-root og sandbox; standardimage er rettet mod test/udvikling | Standardimage alene er ikke produktionstilladelse til fjendtlige mål |
| [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | AA-mål, kontrast, fokus, reflow og input | Automatisk check alene beviser ikke overensstemmelse |
| [Datatilsynet: De grundlæggende principper](https://www.datatilsynet.dk/regler-og-vejledning/grundlaeggende-begreber/hvad-er-dine-forpligtelser/de-grundlaeggende-principper) | Dataminimering og opbevaringsbegrænsning | Faktisk behandlingsgrundlag og leverandører skal vurderes særskilt |
| [Netlify build configuration](https://docs.netlify.com/build/configure-builds/overview/) | Repo-baseret frontendbuild og konfiguration | Ingen antagelse om aktuelt abonnement, region eller kapacitet |
| [W3C CSP Level 3](https://www.w3.org/TR/CSP3/) | CSP, frame-ancestors og forholdet til X-Frame-Options | Working Draft; implementér og test den faktiske browsersemantik |
| [W3C Referrer Policy](https://www.w3.org/TR/referrer-policy/) | Gyldige værdier og effektiv policy | WebSpors udvalgte signal er ikke en fuld policy-audit |
| [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785) | Kanonisk JSON til integritetshash | Hash er ikke bevis for autenticitet |
| [Public Suffix List](https://publicsuffix.org/list/) | Registrerbare domænegrænser | Ikke en database over selskabsejerskab |

Ved første implementation skal udvikleren vælge og pinne PSL-snapshot og parser-/kanoniseringsbiblioteker. Denne pakke hævder ikke, at de allerede er valgt eller valideret. Eksterne trackerdata er bevidst ikke valgt uden licens- og metodereview.
