# API- og datakontrakt

Normativ kontraktversion `1.0.0`. Dette er en specifikation; første build skal omsætte den til runtime JSON Schema/OpenAPI og kontrakttests før UI forbinder til live API. Alle tidspunkter er UTC ISO 8601. Størrelsesgrænser måles i bytes. Ukendte inputfelter afvises.

## Endpoints

| Endpoint | Adgang | Svar |
|---|---|---|
| `POST /v1/scans` | Offentlig, kvotebelagt; JSON max 4 KiB | 202 med job-ID, token, expiry og status |
| `GET /v1/scans/{id}` | Bearer capability | 200 med status; terminalt resultat inline hvis tilgængeligt |
| `DELETE /v1/scans/{id}` | Samme bearer | 204 efter tokenrevokation og planlagt stop/sletning |
| `GET /health/live` | Offentlig | Minimal liveness uden interne detaljer |

Create body: `{ "url": "https://example.com/", "profile": "baseline-v1" }`. URL max 2048 tegn. Bruger kan ikke vælge region, headers, cookies, script eller timeout. `Idempotency-Key` på 128 tilfældige bits kræves fra klienten; samme nøgle og body returnerer samme job og oprindelige token i et kort, krypteret 10-minutters idempotenslager. Samme nøgle med anden body giver 409. Lager må ikke føre til permanent rå URL-opbevaring; slet body efter jobindlæsning, og brug kortlivet HMAC til body-sammenligning. Scope nøglen til IP-HMAC-identitet. Se datalivscyklus.

Create-response: `id`, `accessToken`, `status: queued`, `expiresAt`, `pollAfterSeconds: 2`. Token ligger kun i browserhukommelsen. Poll hver 2 sekunder, backoff til 5 sekunder efter 30 sekunder og ved skjult fane. Ingen progress-procent. Rapport udløber 60 minutter efter oprettelse, også ved fejl.

400 malformed input; 422 disallowed target; 429 kvote med Retry-After; 503 kapacitet; 409 idempotenskonflikt; 404 ukendt ID eller forkert token; 410 for udløbet job med gyldigt token i kort tombstoneperiode. Undgå forskellig fejltekst, der afslører eksistens ved forkert token. DELETE er idempotent; gentagelse med tidligere gyldigt token kan få 204 via kort tombstone. Sletning og stop skal være effektive inden 60 sekunder. Ingen tokenoversigter eller jobliste-endpoint.

## Rapportfelter

| Felt | Type / invariant |
|---|---|
| schemaVersion, engineVersion, scanProfileVersion, rulesetVersion, redactionVersion | Ikke-tomme versionsstrenge |
| datasetVersions | Liste af `{id, version, license, reviewedAt}`; tom ved ingen kilde |
| id, startedAt, finishedAt, expiresAt | Jobidentitet og tider; monoton rækkefølge |
| status | completed eller partial; failed har error, ikke en tom succesrapport |
| target | `{requestedOrigin, finalOrigin}`; ingen path/query/fragment |
| environment | `{browserVersion, region, locale, timezone, viewport}` |
| collectors | De fem faste keys med status, reasonCode, droppedCount og tider |
| limitations | Liste af kendte maskinlæsbare koder, også profilbegrænsninger |
| observations | Typet union defineret i evidensmodellen; max 200 |
| findings | Typede fund med verificerede evidenceIds |
| indicators | I-01..I-04 med `value: number|null`, `reasonCode`, `evidenceIds`, `ruleVersion` |
| integrity | `{algorithm: SHA-256, canonicalization: RFC8785, digest}` over rapport uden integrity-felt |

Collectorstatus `complete`, `partial`, `failed`, `not_run`. Observationer har `id`, `kind`, `collector`, `observedAt`, `data`. Netværk bruger lokal request-reference til at forbinde attempt og response. Findings må ikke referere til slettede eller ukendte observationer. Indikatorers grundlag skal stemme med collectorstatus; valider det semantisk ud over JSON Schema.

## Syntetisk uddrag, ikke fuld rapport

```json
{
  "observations": [{
    "id": "o1", "kind": "response_received", "collector": "network",
    "observedAt": "2026-09-22T12:00:01Z",
    "data": {"requestRef": "r1", "origin": "https://media.example", "status": 200}
  }],
  "indicators": {"I-01": {"value": null, "reasonCode": "NETWORK_PARTIAL", "evidenceIds": ["o1"], "ruleVersion": "1.0.0"}}
}
```

Eksemplet demonstrerer partial/null; det er bevidst ikke en validerbar komplet fixture. Komplette success/partial/failed-fixtures er første buildopgave. Eksport bruger samme schema uden token eller idempotensmetadata. Breaking schemaændring øger major; frontend understøtter eksplicit majorversion. Ingen tavs migration af gamle rapporter.
