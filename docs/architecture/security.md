# Sikkerhed, SSRF og abuse prevention

Dette dokument er releaseblokerende. Truslen er både en ondsindet bruger, der indsender et mål, og en ondsindet offentlig side, der styrer browsertrafik. En frisk BrowserContext er ikke en sikkerhedsgrænse mod browserudnyttelse. Se [primærkilder](../references.md) for OWASP og Playwright; nedenstående er WebSpors egne implementeringskrav.

## Trusler og ejerskab

| Trussel | Kontrol | Verifikation |
|---|---|---|
| SSRF og cloud metadata | Destination-policy på faktisk socket, deny-by-default firewall | Gatewayintegration og packet capture i testnet |
| DNS rebinding/redirect | Valider alle A/AAAA og hvert hop; pin faktisk destination | Kontrolleret DNS-skift og redirectkæde |
| Browserescape | Engangsisolation, sandbox, ingen secrets/mounts | Infra-review og escape-konsekvensanalyse |
| Ressourceangreb | CPU/RAM/tid/bytes/requests/købudget | Store streams, langsom side, uendelig JS |
| Rapporttyveri | Tilfældigt capability-token, TTL, no-store | IDOR og token-tests |
| XSS/prompt injection | Tekstrendering, allowlistet output, ingen rå sideindhold til AI | Ondsindede felter og AI-fixtures |
| Scanning som DoS/proxy | Kvoter pr. bruger og mål, ingen rå response-returnering | Parallel belastnings- og egress-test |

## S-01 URL og DNS

Brug én standardparser og én kanonisk repræsentation i alle lag. Afvis credentials, backslash-tvetydighed, kontroltegn, ikke-HTTP(S), IP-literals, alternative numeriske IP-former, zone identifiers, special-use hostnames og porte ud over 80/443. Internationaliserede domæner normaliseres til ASCII; vis både sikker visning og ASCII ved tvetydighed. Query/fragment afvises i brugerinput, ikke stiltiende fjernet.

Resolver skal følge begrænsede CNAME-kæder og undersøge **alle** A/AAAA. Afvis hele resolutionen, hvis én adresse er ikke-global. Dæk IPv4/IPv6, IPv4-mapped IPv6, loopback, private, link-local, unspecified, multicast, reserved, dokumentationsnet, CGNAT og cloudmetadata. Brug vedligeholdte adresseringsregistre/biblioteker med testet policy, ikke kun tre RFC1918-net. Special-use DNS såsom localhost og lokale interne suffixer afvises før opslag.

## S-02 Faktisk forbindelse

En preflight DNS-kontrol alene er utilstrækkelig. Egressgatewayen resolver, validerer og binder forbindelsen til den godkendte IP, mens hostname/SNI bevares. Ingen anden DNS-resolution må vælge destination efter kontrollen. Nye forbindelser valideres igen; hver redirect, iframe, subressource og scriptinitieret request følger samme regler. Blandet offentlig/privat DNS afvises. Policyfejl er fail-closed.

Worker må fysisk kun nå gatewayen. Blokér direkte TCP/UDP, IPv6-bypass, QUIC, alternativ DNS/DoH, STUN/WebRTC og interne kontroltjenester. Gatewayen må kun nå validerede offentlige HTTP(S)-destinationer. Ingen CONNECT-tunnel til en ukontrolleret adresse eller port. En generisk HTTP-proxy med åben tunneling opfylder ikke kravet.

Metode- og bytegrænser for krypteret trafik kræver en gateway med verificerbar håndhævelse, eksempelvis en særskilt TLS-inspektionsgateway med jobbegrænset tillid og korrekt upstream-certifikatvalidering. Dette er et åbent infrastrukturopdrag (ADR-007), ikke en påstand om at Playwright alene håndhæver det. Hvis TLS-inspektion bruges, beskrives målepåvirkning i profilen; HTTPS-kontrollen skal baseres på verificeret upstream, ikke gatewayens interne certifikat. Ingen offentlig scanning før løsningen er bevist i staging.

## S-03 Isolation

Én engangsworker i hærdet sandbox/container med yderligere VM-/microVM-grænse til fjendtlige browsere. Non-root, Chromium-sandbox aktiv, read-only root, separat begrænset tmpfs, drop capabilities, seccomp/AppArmor eller tilsvarende, ingen privileged mode, host netværk, Docker socket, shared host IPC eller host mounts. Ingen `--no-sandbox`, `ignoreHTTPSErrors` eller generel certifikatbypass. Ingen cloudrolle, credentials, API/AI-nøgler eller lageradgang i worker.

Supervisor er uden for workerens tillidsgrænse. Brug begrænset envejs outputkanal; validér længde og schema. Browseren kan ikke vælge callback-URL eller læse andre jobs. Worker dræbes ved deadline; oprydning er supervisorens ansvar, ikke en `finally`, der kan hænge i browseren. Patch browser og OS løbende; kritisk isolationfejl slukker live-scan.

## S-04 Misbrugskontrol

Startværdier: 3 nye jobs pr. 10 minutter og 20 pr. døgn pr. kortlivet IP-HMAC-identitet; max 1 aktivt job pr. identitet. Globalt 2 workers, 20 ventende jobs, kødeadline 120 sekunder. Pr. registrerbart måldomæne max 1 aktivt og 1 nyt besøg pr. 60 sekunder på tværs af brugere. Målnøgler omfatter både indsendt og final domæne; redirectmålet reserveres før kontakt. Hvis reservation fejler, stop. Subressourceværter får gatewayens samtidighedsgrænser, ikke sitekvoten, så fælles CDN'er ikke behandles som nye top-level scans.

Håndhæv atomisk på tværs af replikaer. Stol kun på klient-IP fra dokumenteret reverse proxy; ignorér brugerleveret X-Forwarded-For. IP-kvoter kan ramme skole-NAT: tilbyd demo og forståelig besked; ingen usikker undtagelse for en skole. Operatør kan reducere grænser uden metodeændring; forøgelser kræver belastningsreview. Dagligt globalt budget og kill switch er obligatorisk før pilot.

## S-05 Resultater og drift

Mindst 256-bit kryptografisk tilfældigt token; gem kun hash, konstanttidskontrol, aldrig token i URL/logs. Rapport-ID er ikke adgang. API svarer `Cache-Control: no-store`; frontend sætter Referrer-Policy no-referrer på scanflow. HTTPS, snæver CORS-allowlist, sikker frontend-CSP og escaped tekst. Links fra evidens er ikke klikbare navigationer til ukontrollerede mål i V1.

API svarer ikke med sidebody, screenshot eller rå proxytrafik. Der er ingen generel fetch-endpoint. Origin-check og requestgrænser supplerer kvoter; de erstatter dem ikke. Netlify previews får ingen produktionsadgang. Incident: sluk admission, stop workers, rotér berørte nøgler, bevar kun redigeret nødvendig hændelsesinformation og følg privacy-vurdering.
