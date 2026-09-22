# AI-boundaries

V1 fungerer fuldt uden AI. Redaktionelle forklaringer er standard. AI er kun et valgfrit sproglag over godkendte strukturerede fund.

## Tilladt input og output

Input: forklaringsniveau, `da`, kendte finding-ID'er, generiske regelbetydninger, allerede beregnede tal og kendte limitations. Origin erstattes med lokal label »destination A«. Ingen URL, sideindhold, HTML, cookie/storage-værdier, rå headers, IP, brugerfritekst eller tokens. Payload bygger på positiv feltallowlist, ikke frasortering af enkelte farlige felter.

Outputschema: liste af `{findingId, explanation, limitationKeys}`. Ingen score, category, probability, nye entities eller ændrede målinger. Max 600 tegn pr. forklaring, max 10 fund. Modellen har ingen værktøjer, netværksadgang, retrieval fra siden eller browserkontrol. Fast promptversion og modelversion logges uden inputdata.

## Validering og fallback

Kontrollér eksisterende finding-ID'er, længde, tilladte limitationKeys, ingen links/HTML og uændrede tal. Tal bør indsættes deterministisk af UI uden for AI-teksten. Validering kan ikke bevise semantisk sandhed; derfor kan AI aldrig tilføje faktuelle påstande om det konkrete website. Kritiske forbehold kommer fra låste skabeloner og vises uafhængigt af AI. Forbudte juridiske/sikkerhedsdomme eller mulig ny faktapåstand medfører kassation og statisk tekst.

Timeout 5 sekunder; højst ét forsøg; længde- og omkostningsbudget pr. rapport og pr. døgn. Ingen AI-kald før evidensvalidering. Ingen fri chat. AI-fejl ændrer hverken status, fund eller indikatorer. AI-forklaringer er tydeligt mærket og indgår ikke i evidenshash eller indikatorberegning.

## Prompt-injection

Alt målsideindhold er upålidelige data. Det må aldrig blive instruktioner i prompten. Selv et cookie-navn eller headerfelt kan indeholde instruktioner; derfor sendes de ikke. Model-output renderes som tekst. Test data, der indeholder »ignore previous instructions«, falske toolkald og krav om nye scores; de må ikke kunne ændre rapporten.

## Releasegate ved aktivering

Mindst 30 reviewede danske cases på tværs af forklaringsniveauer, nul nye målinger/domænepåstande i tests, dokumenteret privacyreview, budgetbegrænsning og fungerende fallback. Manuel faglig review er nødvendig, men udgør ikke garanti for fremtidige output. Ved konstateret opdigtet påstand slås AI fra med kill switch; basisproduktet fortsætter.
