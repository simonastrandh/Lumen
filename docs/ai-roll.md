# AI:s roll i projektet

Uppgiften kräver att AI används **som verktyg** i byggprocessen (Claude Code används
för kodningen) – det krävs INTE att själva appen måste ha en AI-funktion inbyggd
för att uppfylla uppgiften.

## Två möjliga nivåer

1. **Minimum:** AI används bara under byggandet. VG-kraven om "begrepp från
   AI-veckan" och "AI-felen förklaras" uppfylls genom att dokumentera hur Claude
   Code betedde sig under utvecklingen (t.ex. kontextfönster-begränsningar,
   felaktig genererad kod som rättades, prompt-val för olika delar av koden).

2. **Valfritt tillägg:** en AI-funktion i själva produkten, t.ex. progressive
   overload-förslag (ligger i "bör ha, om tiden räcker"). Ger en roligare demo
   men är inte ett krav.

## Beslut
Börja utan AI-funktion i produkten (ren loggningsapp). Lägg till progressive
overload-förslag bara om tid finns kvar efter MVP.

## Att dokumentera löpande under bygget
- Vilka AI-begrepp är relevanta för vilka beslut (hallucination, kontextfönster,
  rätt modell i rätt steg)
- Konkreta AI-fel som uppstod och hur de kopplas till brief/design/prompt
- Exempel: om Claude Code genererar kod som inte matchar datamodellen
  (vikt-typ per övning), beskriv vad som gick fel och hur det rättades till
