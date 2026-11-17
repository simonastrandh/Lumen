# Lumen

Lumen är en webbapp för att logga träning: vikt, reps, tid och distans per övning, och att se sin utveckling över
tid. Den är byggd mobil-först, i mörkt (mörkblått) och ljust (neon lime) läge, i en affischstil inspirerad av Nike.

Projektet är ett skolprojekt i UX-design, byggt på två veckor med Claude Code som AI-verktyg. Appen hette
tidigare Styrkeloggen.

- **Målgrupp:** personer som tränar och vill logga pass digitalt i stället för i en anteckningsbok.
- **Användningskontext:** appen används mitt i ett pass, med kort tid mellan set. Därför är knapparna stora, kontrasten
  hög och inmatningen minimal (hjul i stället för tangentbord).

## Innehåll
- [Kom igång](#kom-igång)
- [Funktioner](#funktioner)
- [Så fungerar det](#så-fungerar-det)
- [Tech-stack](#tech-stack)
- [Projektstruktur](#projektstruktur)
- [Utseende](#utseende)
- [Tillgänglighet](#tillgänglighet) och [prestanda](#prestanda)
- [Data och integritet](#data-och-integritet)
- [Design](#design)

## Kom igång
Kräver [Node.js](https://nodejs.org) 20 eller senare.

```bash
npm install
npm run dev
```

Öppna adressen som visas (normalt http://localhost:5173). På en dator visas appen i en telefonram, och på en
telefon fyller den skärmen.

| Kommando | Vad det gör |
|---|---|
| `npm run dev` | Startar utvecklingsservern |
| `npm run build` | Typkontrollerar och bygger för produktion i `dist/` |
| `npm run preview` | Visar det byggda resultatet lokalt |

## Funktioner
- **Välkomnande:** första gången appen öppnas visas LUMEN i stort. Man går vidare genom att trycka på skärmen eller på
  knappen (Enter fungerar med tangentbord), och därefter tonar appen fram.
- **Hem:** en stor affischsiffra (pass denna månad), nästa pass som en gul rad med spelknapp, "Starta tomt pass",
  startguide för nya användare och "Mina mål". Pennan öppnar redigeringsläge där mål läggs till,
  tas bort och flyttas.
- **Pass:**
  - Nuvarande rotation överst (passen i ordning, vilket som är näst, Aktiv/Pausad) med "Ändra rotation".
  - Mina pass och Mina övningar, och på varje rad en **Starta**-knapp. Starta en övning startar ett pass med bara den.
  - Egna pass av typen styrkepass eller konditionspass. "Lägg till övning" visar dina sparade övningar och en knapp för
    att skapa en ny.
- **Mäts i:** en styrkeövning mäts i valfri kombination av **reps, tid och vikt**, och en konditionsövning i **tid och/eller
  distans**. Ändrar man hur en övning mäts gäller det i alla pass som innehåller den.
- **Aktivt pass:** nästa set visas som en stor siffra (t.ex. 30 kg · 10 reps) med en liten vilorad. När vilan startar
  fälls setet ihop och en ring med tiden tar över, med −30 s, **Pausa** och +30 s. Dessutom set som ändras med hjul,
  tomt pass där man lägger till övningar under passet, samt en sammanfattning med personbästa. Passet sparas löpande
  och skärmen hålls tänd medan det pågår.
- **Mål:** ett mål hör till en övning och man väljer själv vilka mått som ska följas (vikt, reps, tid, distans). Hur nära
  målet man är visas i procent.
- **Statistik:** en stor siffra (pass i vald period), tidsfilter, nyckeltal, diagram, senaste pass med sök, personbästa och
  styrkeökning, samt per övning. Loggade pass går att ta bort.
- **Inställningar:** standardvilotid, **enhet (kg och km eller lb och miles)**, **utseende (mörkt eller ljust)** och
  rensa all data.

## Så fungerar det
- **Appen börjar tom.** Du skapar dina egna pass, övningar och mål. Övningar från det inbyggda biblioteket känns igen när
  du skriver deras namn (t.ex. Bänkpress).
- **Mål följer det du gör.** "Nuvarande" i ett mål följer ditt bästa utförda värde. Ändrar du en övnings standardvärde så
  att du passerar målet uppdateras både personbästa, mål och statistik.
- **Personbästa räknas som bästa set**, med högst distans eller vikt först och därefter tid eller flest reps. Värdena hör
  alltså ihop i samma set.
- **Enheter:** allt sparas alltid i kg och km. Valet av lb och miles ändrar bara hur vikter och sträckor visas och
  matas in, så man kan byta fram och tillbaka utan att något räknas om i datan.

## Tech-stack
- React 19 + TypeScript + Vite
- react-router för navigering
- CSS-variabler (designtokens) + CSS Modules, inget Tailwind
- Ingen backend: all data sparas lokalt i webbläsaren (`localStorage`)

## Projektstruktur
```
src/
  App.tsx, main.tsx   routing och start
  components/
    ui/         små, generella delar: Button, Card, Icon, Tag, TextField, BottomSheet, diagram, ...
    pickers/    hjulen (WheelPicker), tidsfält och MeasureFields (set, reps, vikt, tid, distans)
    layout/     skalet runt alla skärmar: AppShell, BottomNav, välkomnandet
  screens/      en mapp per skärm, med skärmens egna delar bredvid
    home/       Hem: Mina mål, startguide
    workouts/   Pass: lista, redigerare, översikt, övningsblad, rotation
    active/     Aktivt pass: timer, setlista, sammanfattning, sparat pågående pass
    statistics/ Statistik
    settings/   Inställningar
  store/        WorkoutStore (pass, övningar, mål, historik, personbästa), SettingsStore, rotation, migrering
  data/         typer och rena funktioner: övningar, pass, mål, statistik, enheter (kg/lb), navigation
  hooks/        useLocalStorageState
  styles/       designtokens (mörkt/ljust), globala stilar och det platta kortet (chrome.module.css)
```

## Utseende
Affischstil: en yta, en accentfärg, stora versala Anton-rubriker och siffror, och Geist för all annan text. Allt är
platt med skarpa hörn och hårfina linjer, utan glas, glöd eller skuggor. Principen är att varje skärm har **en enda hög
röst** (en stor siffra eller ett stort ord) och att resten är tyst.
- **Tokens:** färger, radier och typsnitt ligger som CSS-variabler i `src/styles/tokens.css`. Mörkt läge är mörkblått,
  ljust läge är neon lime med svart text. Temat väljs i Inställningar och sätts som `data-theme` på `<html>`.
- **Accent:** neon lime används som fyllning (knappar, valda val, bockar) med svart text. För accentfärgad text, ikoner
  och grafik finns `--accent-ink`, som är lime i mörkt läge men svart i ljust (neon har för låg kontrast som text).
- **Responsivt:** fullbredd på telefon med fluida marginaler och hänsyn till hak och hemfält. På dator visas appen i en
  telefonram och alla paneler öppnas inuti den.

## Tillgänglighet
- Text och kontroller är kontrollerade mot WCAG AA i mörkt läge. Accentfärgad text i ljust läge använder svart
  (`--accent-ink`).
- Hjulen för vikt och tid är `spinbutton`-kontroller som styrs med piltangenter, och timern annonserar när vilan är slut.
- Paneler är `<dialog>` (fokus och Esc ingår). "Minska rörelser" stänger av animationerna (välkomnandet och att setet fälls ihop när vilan startar).

## Prestanda
Appen är lätt: inga bilder och inga tunga effekter, bara text och CSS. Prestandan är inte mätt på en riktig telefon.

## Data och integritet
Allt sparas lokalt på enheten under nycklar som börjar på `styrkeloggen-` (prefixet är kvar från appens första namn,
så att redan sparad data inte försvinner). Inget skickas någonstans. "Rensa all data" i Inställningar tar bort allt.
Ett engångssteg (`src/store/migrate.ts`) städar bort äldre exempeldata.

## Design
Figma: https://www.figma.com/design/dEvjPxsadnhzsDhsxzXlii/Content-Studio
(sidorna "Brief" och "Mind-map"). Figma-skärmarna ligger före flera av ändringarna ovan och är inte helt synkade med
den färdiga appen.
