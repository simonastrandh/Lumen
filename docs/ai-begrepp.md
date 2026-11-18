# Val kopplade till AI-veckans begrepp

Hur begrepp från AI-veckan förklarar vilka val som gjordes i projektet. Konkreta fel finns i [ai-fel.md](ai-fel.md).

## Hallucination
En språkmodell skriver sannolika svar, inte kontrollerade svar. Den kan därför påstå något som inte stämmer.
- **Exempel:** README påstod att kontrasten var kontrollerad mot WCAG AA, men det gällde den gamla designen (fel 1). Ett
  dolt övningsbibliotek antogs vara borta när det bara hade slutat visas (fel 2).
- **Val som följde:** påståenden om projektet ska stödjas av en mätning eller en sökning i koden. Kontrasten räknas ut
  med ett skript ([tillganglighet.md](tillganglighet.md)), och kod som ska tas bort söks upp innan den anses borta.

## Kontextfönster
Modellen ser bara en begränsad mängd text åt gången. I ett långt arbete sammanfattas äldre delar, och detaljer försvinner.
- **Exempel:** efter en lång session hade radnummer och filinnehåll ändrats, och en ersättning efter radnummer tog bort fel
  rad (fel 6). I Figma kördes ett skript om utan att minnas att skärmen redan hade ändrats av användaren.
- **Val som följde:** regler och struktur ligger i filer som läses om (`AGENTS.md`, `README.md`) i stället för att stå i
  samtalet. Filer läses igen innan de ändras. Arbetet delades i små steg som kontrolleras direkt, och en uppgift som
  kräver mycket kontext (som att jämföra hela appen) görs i ett eget steg.

## Rätt modell i rätt steg
Olika uppgifter kräver olika mycket. Rutinarbete och formfrågor behöver inte den dyraste modellen, men svåra och
formgivande uppgifter har nytta av en starkare.
- **Exempel:** vardagliga ändringar (texter, avstånd, ikoner, rättningar) gjordes med standardmodellen. För den
  svåra uppgiften att rita en hand i SVG som liknade en förlaga byttes till en starkare modell, och sedan tillbaka.
  Figma-arbetet och kodarbetet hölls isär: design godkändes av användaren i Figma *före* koden skrevs.
- **Val som följde:** byt modell när uppgiftens svårighet ändras, och låt människan godkänna design före kod.

## Prompten och briefen styr resultatet
AI gör det som frågas, inte det som menas. Otydliga prompter gav rätt kod för fel mål.
- **Exempel:** "dölj biblioteket" gav ett dolt men kvarvarande bibliotek (fel 2). "Jag vill inte att några funktioner ska
  ändras, endast UI" blev en uttrycklig regel, och den står nu i `AGENTS.md`.
- **Val som följde:** briefen innehåller krav (vikt, tillgänglighet, vad som inte delas med AI) som kan kontrolleras, och
  prompter anger vad som ska göras *och* vad som inte ska ändras.

## Människan i loopen
Ändringar visades och godkändes före publicering. Inget pushades till GitHub utan uttryckligt ja, och varje designval
gick via Figma först. Se [sakerhet.md](sakerhet.md).
