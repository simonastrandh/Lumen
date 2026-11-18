# AGENTS.md

Instruktioner till AI-kodverktyg (t.ex. Claude Code) som arbetar i det här repot. Människor hittar projektbeskrivningen i
[README.md](README.md).

## Projektet
Lumen är en svensk webbapp för att logga träning (React 19, TypeScript, Vite, CSS Modules). All data sparas lokalt i
webbläsaren (`localStorage`), det finns ingen backend, inga konton och inga API-nycklar. All text i appen är på svenska.

## Kommandon
Node.js 20 eller senare krävs.

| Kommando | Vad det gör |
|---|---|
| `npm install` | Installerar beroenden |
| `npm run dev` | Startar utvecklingsservern (http://localhost:5173) |
| `npm run build` | Typkontroll (`tsc -b`) och produktionsbygge. Måste gå igenom utan fel |

Det finns inga automatiska tester och ingen linter. TypeScript körs strikt (oanvända variabler är fel), så `npm run build`
är den kontroll som ska köras efter varje ändring. Kontrollera dessutom UI-ändringar i webbläsaren, på mobilbredd (375 px)
och i telefonramen på datorskärm.

## Struktur
```
src/components/ui/       små, generella delar (Button, Tag, BottomSheet, SortableList, ...)
src/components/pickers/  hjul, tidsfält, MeasureFields, ExercisePicker
src/components/layout/   AppShell, BottomNav, Welcome
src/screens/<skärm>/     en mapp per skärm (home, workouts, active, statistics, settings) med skärmens egna delar
src/store/               WorkoutStore (pass, övningar, mål, historik), SettingsStore, migrate.ts
src/data/                typer och rena funktioner (övningar, pass, mål, statistik, enheter)
src/hooks/               useLocalStorageState, useFitScale, useWorkoutMinutes
src/styles/              tokens.css (designtokens), global.css, chrome.module.css
```
Delar som används av flera skärmar ska ligga i `components/`, inte i en skärmmapp.

## Regler för kod
- **Stil:** använd CSS-variablerna i `src/styles/tokens.css` och hårdkoda inga färger. Stilen är platt (skarpa hörn,
  hårfina linjer, inga skuggor eller glas) med Anton för rubriker och siffror och Geist för övrig text. Accentfärgad
  *text* och ikoner använder `--accent-ink`, medan fyllda ytor använder `--accent`. Varje skärm har en enda hög röst
  (en stor siffra eller ett stort ord) och resten ska vara tyst.
- **Mörkt och ljust läge:** båda måste fungera. Temat sätts som `data-theme` på `<html>`.
- **Animationer:** respektera `prefers-reduced-motion`.
- **Data:** vikter och sträckor sparas alltid i kg och km. Enhetsvalet (kg/lb) påverkar bara visning och inmatning
  (`src/data/units.ts`).
- **Lagring:** nycklarna i `localStorage` börjar på `styrkeloggen-` (prefixet är kvar från appens första namn och får inte
  ändras, annars försvinner användarnas data). Ändras formen på sparad data ska `src/store/migrate.ts` få ett nytt steg och
  en högre `CURRENT`.
- **Dokumentation i repot:** inga personuppgifter eller hemligheter i `docs/` heller.
- **Inga hemligheter:** lägg aldrig nycklar, lösenord, tokens eller personuppgifter i repot. `.env`-filer är ignorerade i
  `.gitignore`.
- **Tillgänglighet:** knappar ska ha tydlig `aria-label` när de saknar text, paneler är `<dialog>` (se `BottomSheet`).

## Arbetssätt
- Gör bara det som efterfrågas. En ren designändring ska inte ändra funktioner.
- Håll rapporter och commit-meddelanden korta och på svenska.
- Dokumentationen ligger i `docs/` (se `docs/README.md`). Nya beslut loggas i `docs/beslutslogg.md`, och ändras färger,
  komponenter eller tillgänglighet ska `docs/design-system/` och `docs/tillganglighet.md` uppdateras.
- Pusha aldrig till GitHub utan att användaren har sagt det. Ett push till `main` publicerar sidan automatiskt på GitHub
  Pages (`.github/workflows/deploy.yml`).
