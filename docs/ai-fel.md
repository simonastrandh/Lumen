# AI-fel: vad som hände och hur det upptäcktes

Claude Code skrev det mesta av koden, och därför blev felen den främsta lärdomen om AI som verktyg. Varje fel nedan har
en tydlig koppling till briefen, designen eller prompten (se [ai-begrepp.md](ai-begrepp.md) för begreppen).

| # | Vad som hände | Hur det upptäcktes | Koppling | Åtgärd |
|---|---|---|---|---|
| 1 | **Föråldrat påstående:** README sade att färgerna var kontrollerade mot WCAG AA, men kontrasten hade bara mätts för den gamla designen. Efter ombyggnaden stämde det inte längre | Vid granskning av README inför inlämning | Briefens tillgänglighetskrav. *Hallucination*: AI upprepade ett sant men gammalt påstående som om det fortfarande gällde | Påståendet togs bort, kontrasten mättes om och redovisas i [tillganglighet.md](tillganglighet.md) |
| 2 | **Gömt bibliotek:** ett övningsbibliotek med ca 30 övningar låg kvar i koden efter att det slutat visas | Användaren frågade om det fanns kvar | Prompten bad om att dölja det, inte ta bort det | Borttaget, och en migrering bevarade användarens sparade data |
| 3 | **Bugg som en rättning orsakade:** en omskriven dragfunktion gav ett negativt marginal på listor. Med noll mål hamnade knappen "Lägg till mål" ovanpå rubriken | Användaren skickade en skärmbild | Designkravet om luft och tydlighet. AI testade bara fallet med flera rader | Tom lista renderas inte längre, och marginalen gäller bara listor med rader |
| 4 | **Dålig dragprestanda:** första versionen av sortering ritade om hela listan vid varje musrörelse och den dragna raden hamnade fel | Användaren: "det laggar" (skärmbild) | Briefens krav på snabb, svettiga händer-vänlig användning | Skrevs om så att bara en `transform` ändras under draget |
| 5 | **Tillstånd följde med mellan pass:** när en spärr lades till för pågående pass återanvändes samma komponent, och det gamla passets övningar skrev över det sparade passet | Egen test i webbläsaren efter ändringen | Promptens avgränsning: ändra inte funktioner, men en fix fick en bieffekt | Komponenten får en ny instans per pass (`key`) |
| 6 | **Fel rad ersatt:** ett skript ersatte en rad efter radnummer och tog bort fel kod. Ett kompileringsfel blev committat innan det rättades | `npm run build` visade felet direkt efteråt | Prompten var snabb, kontrollen kom efteråt. *Kontextfönster*: radnummer var inte längre aktuella | Rättades i en ny commit. Nu byggs alltid *före* commit |
| 7 | **Platshållare i kod:** en skärm skrevs en gång med en tom platshållare i stället för riktig kod | Vid kontroll av bygget och sidan | AI hoppade över delar när uppgiften var stor | Filen skrevs om och kontrollerades i webbläsaren |
| 8 | **Orimlig tidsuppskattning:** först räknades en fast tid per set. Efter kritik räknades den om från övningens tid och vila men blev då för kort (5 min för bänkpress 3 × 10), eftersom uppställning, start före varje set och tid per rep saknades | Användaren två gånger: "inte rimlig" och "lite väl optimistisk" | Antaganden gjordes utan att redovisas eller frågas | Modellen byggdes om med uppställning (60 s), 5 s per rep, 15 s start per set och vila. Antagandena redovisas i README |
| 9 | **Verktyg som inte stöds:** försök att lägga till ESLint misslyckades eftersom `typescript-eslint` inte stöder TypeScript 7 | Installationen gav ett versionsfel | AI föreslog en lösning utan att veta om versionerna passade | Ändringen rullades tillbaka i stället för att tvinga igenom installationen |
| 10 | **Ritad hand liknade inte förlagan:** proportionerna blev fel två gånger | Användaren jämförde mot sin referensbild | Prompten hade en bild som underlag, AI uppskattade formerna | Efter två justeringar valde användaren att ta bort handen, eftersom den inte tillförde något |
| 11 | **Läst men inte tillämpat:** en knapp använde neonfärg som textfärg, vilket ger kontrast 1,2:1 i ljust läge | Hittades när kontrasten räknades ut för dokumentationen | Briefens tillgänglighetskrav | Byttes till `--accent-ink` |

## Mönster
- **AI testar det som är lätt att testa.** Felen 3 och 5 uppstod i kantfall (inga mål, byte mellan pass) som bara syntes när
  någon provade dem. Därför provas nu varje ändring i webbläsaren, och kantfall provas särskilt.
- **Säkra påståenden är farliga.** Fel 1 och 2 handlade om att något *påstods* eller *antogs* utan att kontrolleras mot
  koden. Regeln är nu att mäta eller söka i koden innan något påstås.
- **Små steg och bygg före commit** fångar fel 6 och 7 tidigt.
