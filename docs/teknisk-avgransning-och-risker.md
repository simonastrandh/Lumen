# Teknisk avgränsning

- **Plattform:** webbapp (mobilanpassad), inte native app – enklare att bygga
  och demonstrera på 2 veckor.
- **Datalagring:** börja med lokal lagring (klientsidan); lägg till databas
  bara om MVP är klar i god tid.
- **Datamodell:** måste skilja på vikt-typ per övning (fria vikter/kg,
  kroppsvikt, maskinnivå) – annars blir grafer/jämförelser missvisande.
- **Validering:** enkel rimlighetskontroll på inmatad vikt/reps.
- **Hosting:** lokal utveckling under bygget, men deploy till en gratis tjänst
  (t.ex. Vercel/Netlify/Render) inför presentationsdagen – en `localhost`-länk
  fungerar bara på egen dator och är opålitlig för en live-demo.

# Kända risker att bevaka

| Risk | Varför det spelar roll | Hantering |
| --- | --- | --- |
| Scope creep via "bör ha"-funktioner | Kroppskarta/PR/progressive overload kan lätt dra ut på tiden | Bygg MVP färdigt först, resten är explicit "om tid finns" |
| Förlorad data utan konto/databas | Användare tappar historik vid rensad cache | Dokumentera som medvetet val, inte bugg; motivera i rapporten |
| Felaktig/orimlig inmatning | Fel vikt (t.ex. 1000 kg) förstör statistik/grafer | Enkel validering innan data sparas |
| TikTok-länkar som inte fungerar som tänkt | Odokumenterade djuplänkar kan sluta fungera utan förvarning | Använd bara officiell söklänk (tiktok.com/search?q=...) |
| För lite tid kvar till dokumentation | Rapporten (brief, beslutslogg, säkerhet) är lika viktig som koden för betyget | Dokumentera beslut löpande under bygget, inte i slutet |
