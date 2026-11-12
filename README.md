# Lumen

Lumen är en webbapp för att logga träning: vikt, reps, tid och distans per övning, och att se sin utveckling över
tid. Den är byggd mobil-först, i mörkt och ljust läge, med en krom-/holografisk ryggrad som bakgrund.

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
- [Bakgrundsbild](#bakgrundsbild-ryggraden)
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
- **Välkomnande:** första gången appen öppnas visas en landningssida där bakgrunden är i centrum. Man går vidare
  genom att trycka på skärmen eller på knappen (Enter fungerar med tangentbord), och därefter tonar appen fram.
- **Hem:** nästa pass (från rotationen eller slumpat), "Fortsätt pass" om ett pass pågår, startguide för nya användare
  och "Din utveckling" med pass per månad och personliga mål.
- **Pass:**
  - Egna pass av typen styrkepass eller konditionspass. Passtypen styr ikon (skivstång eller blixt) och vilka övningar som
    visas först när man lägger till.
  - Egna övningar. "Lägg till övning" i ett pass visar en lista med dina sparade övningar och en knapp för att skapa en ny.
  - Rotation: en ordnad lista av pass som Hem föreslår i tur och ordning.
- **Mäts i:** en styrkeövning mäts i valfri kombination av **reps, tid och vikt**, och en konditionsövning i **tid och/eller
  distans**. Ändrar man hur en övning mäts gäller det i alla pass som innehåller den.
- **Aktivt pass:** en timer som visar det som tickar just nu (vila, tid för ett set eller stoppur), set som ändras med hjul,
  tomt pass där man lägger till övningar under passet, samt en sammanfattning med personbästa. Passet sparas löpande
  och skärmen hålls tänd medan det pågår.
- **Mål:** ett mål hör till en övning och man väljer själv vilka mått som ska följas (vikt, reps, tid, distans). Hur nära
  målet man är visas i procent.
- **Statistik:** översikt (pass totalt, veckor i rad, set, tid, total vikt, graf, senaste pass, personbästa) med tidsfilter
  och sök, samt per övning. Loggade pass går att ta bort.
- **Inställningar:** namn, standardvilotid, **enhet (kg och km eller lb och miles)**, animerad bakgrund och rensa all data.

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
    layout/     skalet runt alla skärmar: AppShell, BottomNav, bakgrund och partiklar, välkomnandet
  screens/      en mapp per skärm, med skärmens egna delar bredvid
    home/       Hem: hälsning, Din utveckling, mål, startguide
    workouts/   Pass: lista, redigerare, översikt, övningsblad, rotation
    active/     Aktivt pass: timer, setlista, sammanfattning, sparat pågående pass
    statistics/ Statistik
    settings/   Inställningar
  store/        WorkoutStore (pass, övningar, mål, historik, personbästa), SettingsStore, rotation, migrering
  data/         typer och rena funktioner: övningar, pass, mål, statistik, enheter (kg/lb), navigation
  hooks/        useLocalStorageState
  styles/       designtokens (ljust/mörkt), globala stilar och krom-kortet (chrome.module.css)
```

## Utseende
- **Tokens:** färger, radier och typsnitt ligger som CSS-variabler i `src/styles/tokens.css`. Ljust och mörkt läge följer
  enhetens inställning.
- **Krom-kort:** kort har skarpa hörn med två kapade hörn och en hårfin kant som skiftar turkos, lila och guld
  (`src/styles/chrome.module.css`, används med `composes`). Knappar och fält är nästan skarpa (2 px).
- **Text på bakgrunden:** löpande text som ligger direkt på bakgrunden får en mjuk, mörk fläck bakom sig så att den är
  läsbar utan att dölja ryggraden.
- **Färg betyder något:** lila och lagerikon betyder pass, turkos betyder övningar.
- **Responsivt:** fullbredd på telefon med fluida marginaler och hänsyn till hak och hemfält. Aktivt pass är anpassat
  för små skärmar och liggande läge.

## Bakgrundsbild (ryggraden)
Alla sidor har en krom-/holografisk ryggrad som bakgrund, inspirerad av activetheory.net
(`src/components/layout/BackgroundSpine.tsx`). Den är en statisk bild, inte en 3D/WebGL-scen. Bilden ligger i
`src/assets/spine-bg.webp` (`.png`/`.jpg` fungerar också). Saknas den visas en platshållare.

Bakgrunden är levande utan 3D: ryggraden svävar långsamt, ljus vandrar över olika kotor, färgtonen skiftar mellan
turkos, lila och guld, och guldstoft driver uppåt (`src/components/layout/ParticleField.tsx`, en lätt canvas). I
Inställningar kan animationen stängas av, och har användaren valt "minska rörelser" i systemet står allt still.

Prompt som användes (Canva-bildgenerering, stående 9:16):

> A photorealistic 3D render of a human spine / vertebral column made of liquid chrome and iridescent
> holographic metal, floating vertically in a near-black void, oil-slick reflections shifting between
> teal/cyan, violet/purple and gold/amber across its surface, soft out-of-focus golden particle dust
> scattered around it, dramatic rim lighting, high detail, cinematic render, vertical composition,
> dark background, no text, no logos, no watermark

## Tillgänglighet
- Text och kontroller är kontrollerade mot WCAG AA i mörkt läge. Guldtext i ljust läge använder en mörkare ton
  (`--gold-text`).
- Hjulen för vikt och tid är `spinbutton`-kontroller som styrs med piltangenter, och timern annonserar när vilan är slut.
- Paneler är `<dialog>` (fokus och Esc ingår). "Minska rörelser" stänger av bakgrundens rörelse, kantens glidning och
  välkomnandets animationer.

## Prestanda
Bakgrundsbilden, animationerna och glaseffekten (`backdrop-filter`) kan vara tunga på äldre mobiler. Bilden är
komprimerad till WebP, partiklarna pausar när fliken inte syns och animationen kan stängas av i Inställningar.
Prestandan är inte mätt på en riktig telefon.

## Data och integritet
Allt sparas lokalt på enheten under nycklar som börjar på `styrkeloggen-` (prefixet är kvar från appens första namn,
så att redan sparad data inte försvinner). Inget skickas någonstans. "Rensa all data" i Inställningar tar bort allt.
Ett engångssteg (`src/store/migrate.ts`) städar bort äldre exempeldata.

## Design
Figma: https://www.figma.com/design/dEvjPxsadnhzsDhsxzXlii/Content-Studio
(sidorna "Brief" och "Mind-map"). Figma-skärmarna ligger före flera av ändringarna ovan och är inte helt synkade med
den färdiga appen.
