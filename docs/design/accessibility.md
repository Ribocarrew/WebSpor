# Tilgængelighed

Mål: WCAG 2.2 niveau AA for alle kerneflows. En automatisk test alene dokumenterer ikke overensstemmelse. Se [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/). Nedenstående er projektets kontrolplan.

| Område | Krav og manuel kontrol |
|---|---|
| Tastatur | Alt kan betjenes uden mus; logisk fokusorden; ingen fælder; skip-link |
| Fokus | Tydelig synlig markering; ikke skjult af sticky elementer; tilbage til udløser efter dialog |
| Kontrast | Normal tekst mindst 4.5:1; stor tekst 3:1; nødvendige UI-grænser/grafik 3:1 |
| Responsivitet | 320 CSS-pixels og 400 % zoom; ingen tab af indhold/funktion |
| Form | Synlige labels; fejltekst knyttet til felt; fejlresume ved flere fejl; ingen farve alene |
| Status | `role=status`/polite live-region for faseskift; ikke oplæsning af hvert request |
| Struktur | Én h1, logiske overskrifter, landmarks; rigtige knapper, links og tabeller |
| Touch | Projektmål mindst 44×44 px for primære controls; mindst WCAG 2.2 target-size krav øvrige steder |
| Motion | prefers-reduced-motion; ingen blink, autoplay eller nødvendig animation |
| Grafik | Tekst/tabelalternativ, legend, labels og mulighed for at forstå uden farve |
| Sprog | `lang=da`; tekniske ord forklaret; skift af indhold bevarer fokus |

Testmatrix: Chrome/Edge med tastatur, Firefox til layout/semantik, NVDA + Firefox eller Chrome på Windows, VoiceOver + Safari på iOS/macOS. Mobilweb testes mindst ved 320, 375 og 768 CSS-pixels; desktop 1280 og 1440. Test actual support ved release, ikke kun dokumentér ønsket liste.

Automatisk axe-test på forside, running, complete, partial, failed og demo. Manuel gennemgang af hele scan→evidens→eksport/slet-forløbet. Dokumentér afvigelser med alvor, reproduktion og ejer. Blokerende tastatur-, forståelses- og skærmlæserfejl skal lukkes før offentlig pilot. Fremtidige nye komponenter genåbner relevante checks.
