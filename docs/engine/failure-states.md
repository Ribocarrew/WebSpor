# Fejltilstande

UI må aldrig erstatte fejl med succes, nul eller demo. Public errors indeholder `code`, `messageKey`, `retryable`, eventuelt `retryAfterSeconds` og tilfældig supportreference; ingen stacktrace, URL-query eller interne IP'er.

| Code | Slutstatus | Brugerbesked/handling | Data |
|---|---|---|---|
| INVALID_TARGET | Ingen job | Brug offentlig URL uden personlige parametre | Ingen |
| TARGET_DISALLOWED | failed/ingen job | Målet kan ikke undersøges | Ingen intern årsag |
| RATE_LIMITED | Ingen job | Vent det oplyste interval | Retry-After |
| QUEUE_FULL | Ingen job | Prøv senere | Ingen |
| QUEUE_EXPIRED | failed | Jobbet nåede ikke at starte | Ingen |
| DNS_FAILED | failed | Adressen kunne ikke findes | Ingen |
| TLS_FAILED | failed | Sikker forbindelse kunne ikke oprettes | Ingen bypass |
| ACCESS_BLOCKED | failed/partial | Siden begrænsede scannerens adgang | Ingen CAPTCHA-omgåelse |
| REDIRECT_LIMIT | failed/partial | For mange viderestillinger | Kun gyldige deldata |
| NAVIGATION_TIMEOUT | failed/partial | Besøget nåede ikke at blive færdigt | Afhænger af gyldig evidens |
| RESOURCE_LIMIT | partial/failed | Scannens grænse blev nået | Dækning og dropped-count |
| COLLECTOR_FAILED | partial | En del kunne ikke undersøges | Andre collectors beholdes |
| WORKER_CRASH | failed/partial | Scanneren stoppede | Kun allerede valideret output |
| SCHEMA_INVALID | failed | Intet pålideligt resultat | Ugyldigt output publiceres ikke |
| AI_UNAVAILABLE | Uændret rapport | Brug redaktionel forklaring | Evidens uændret |
| CANCELLED | cancelled | Undersøgelsen er stoppet | Slet midlertidige data |
| RESULT_EXPIRED | HTTP 410 | Resultatet er udløbet | Ingen automatisk genscanning |

Partial kræver mindst én gyldig observation, men ingen mindste mængde, der udløser en sikkerhedsvurdering. Hvis der ikke findes gyldig evidens, er resultatet failed. Status og collectorstatus skal være konsistente. CAPTCHA-genkendelse er heuristisk; ved tvivl sig »Indholdet kunne ikke vurderes«, ikke en sikker CAPTCHA-diagnose.

UI netværksfejl stopper ikke nødvendigvis worker: vis »Forbindelsen til scanneren er afbrudt«, og genoptag kun statuspoll med samme token. Ingen automatisk nyt scan. Server retries er højst én genlevering ved fejl før første netværksrequest; efter første request kræves brugerens nye scan for at undgå gentagne besøg.
