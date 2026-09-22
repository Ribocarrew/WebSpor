# Evidens- og klassifikationsmodel

## Fire adskilte lag

| Lag | Indhold | Må ikke blive til |
|---|---|---|
| Observation | Browserhændelse, tidspunkt, collector og redigerede felter | Ubegrundet hensigt |
| Klassifikation | Deterministisk regel anvendt på observation | Universel sandhed om virksomhed |
| Fortolkning | Generisk forklaring knyttet til fund | Ny måling eller juridisk dom |
| Ukendt | Manglende dækning, tvetydighed eller utilstrækkelig kilde | Nul eller godkendt |

## Identitet og provenance

Rapport har `schemaVersion`, `scanProfileVersion`, `engineVersion`, `rulesetVersion`, `datasetVersions`, `redactionVersion`, start/sluttid, egressregion og browserbuild. Observation-ID er unikt inden for rapporten. Fund har stabile regel-ID'er og refererer til en eller flere observationer. Kilder har version, licens, provenance og hentetid; ukendt version er ikke acceptabel som aktiv klassifikationskilde.

Evidens er en redigeret, maskinlæsbar observation, ikke rå pakker eller bevis for alt, der skete. Gem SHA-256 over kanonisk redigeret JSON (RFC 8785 i implementationen). Hash kontrollerer integritet efter eksport; den beviser ikke scannerens sandhed eller autenticitet. Ingen hash af hemmelige cookie-værdier eller rå URL'er.

## Tilladte observationer

- `request_attempt`: destination-origin, metode, resource type, relativ tid og lokal request-reference.
- `request_blocked`: samme sikre metadata plus public reason code. Må aldrig tælles som kontaktet tjeneste.
- `response_received`: reference til request, HTTP-status, origin og tid. Det dokumenterer browserrespons, ikke en bestemt persons delte data.
- `cookie_stored`: redigeret navn, domain og attributter; ingen værdi eller path.
- `cookie_set_attempt`: redigerede attributter fra header. Er ikke det samme som gemt cookie.
- `storage_summary`: origin, local/sessionStorage og antal, med tilgængelighed.
- `header_check`: headernavn, tilstedeværelse, parserstatus og normaliserede sikre direktiver. Rå CSP-report URL'er må ikke eksponeres.
- `transport`: final URL-scheme og browserens TLS-fejlstatus; ingen påstand om fuld TLS-audit.

Alle strenge har længdegrænser og renderes som tekst. Ukendte felter afvises. Evidens forblokering må ikke indeholde interne IP'er, proxyadresser eller stier. Max 200 events; overskud giver partial med dropped-count.

## Klassifikation uden hardcoding

Første-/tredjepart beregnes med Public Suffix List på registrerbart domæne mod final top-level origin. PSL-version følger rapporten. IP-literals er afvist. Samme registrerbare domæne betyder ikke samme juridiske enhed; CNAME-cloaking afgøres ikke i V1.

Generelle regler må bruge observationer og versionerede eksterne signaturdata. En kildepost om et tracker-domæne er en klassifikationssignatur, ikke en hardcodet dom over det undersøgte website. Ingen `if targetHost === ...` i rapport, score eller UI. Ingen match på løs substring. Domænesuffixmatcher skal respektere labelgrænser, internationaliserede domæner og PSL.

V1 kan frigives uden tracker-datasæt: alle formål er da ukendte, og trackerindikator er null. Et datasæt skal først vælges, licensvurderes og testes (ADR-009). Udgået/fejlet kilde erstattes ikke med AI eller tavse gamle data. Pin en godkendt version; vis dens alder og gennemfør review mindst hver 30. dag. Over 90 dage uden review deaktiveres formålsklassifikation.

## Evidensstyrke og konflikt

`observed` er direkte browserobservation. `matched` er regel/kildematch. `inferred` er eksplicit begrænset faglig fortolkning, aldrig basis for nye tal. `unknown` er manglende grundlag. Brug ikke numeriske confidence-procenter uden kalibrering. Kilder, der er uenige, vises som konflikt og giver ukendt samlet formål; behold begge kildehenvisninger.

Et fund skal indeholde `id`, `ruleId`, `ruleVersion`, `category`, `epistemicStatus`, `evidenceIds`, `sourceRefs`, `explanationKey`, `limitations`. Validator kræver mindst én eksisterende observation, kompatibel collectorstatus og kendt regel. Ingen evidensreferencer → intet fund. Juridiske labels som »ulovlig«, »GDPR-brud« og »sælger data« findes ikke i modellen.
