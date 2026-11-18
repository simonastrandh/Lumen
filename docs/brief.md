# Brief – Lumen

Lumen hette först Styrkeloggen (se beslutsloggen). Briefen gäller hela projektet.

## Vad är det?
Lumen är en webbapp för att logga pass: vikt, reps, tid och distans per övning, och att se sin progression över tid.
Byggs på två veckor med Claude Code som AI-verktyg.

## Målgrupp och problem
- **Målgrupp:** personer som tränar och vill logga sina pass digitalt i stället för i en anteckningsbok eller ett löst
  Excel-dokument.
- **Problem:** svårt att se sin progression (vilken vikt klarade jag förra veckan?) utan ett strukturerat sätt att spara
  data per övning över tid.
- **Användningskontext (viktig för UX):** appen används mitt i ett pass, ofta med svettiga händer och kort tid mellan set
  – inte i lugn och ro vid datorn. Det styr designen: stora knappar, hög kontrast, minimal inmatning (hjul i stället för
  tangentbord) och snabb loggning (högst 2–3 tryck per set).

## Krav

### Vikt (hur tung appen får vara)
Appen ska vara snabb att öppna på en telefon i ett gym med dålig täckning.
- Inga bilder, videor eller tunga bibliotek. Bara text, CSS och SVG-ikoner.
- Beroenden: bara React, React Router och Vite (bygge). Ingen UI-ramverkspaket, ingen Tailwind.
- Mål: under 150 kB gzip för all kod och stil. **Uppmätt: ca 125 kB gzip** (JS 116 kB + CSS 9 kB, `npm run build`).
- Typsnitt (Anton och Geist) hämtas från Google Fonts, se [sakerhet.md](sakerhet.md) för avvägningen.

### Tillgänglighet
- Färgkontrast enligt WCAG AA: 4,5:1 för text och 3:1 för kanter och ikoner, i både mörkt och ljust läge.
  Uppmätta värden finns i [tillganglighet.md](tillganglighet.md).
- Stora tryckytor (knappar och reglage i regel 40 px eller större).
- Hela appen går att använda med tangentbord. Hjul styrs med piltangenter, paneler är `<dialog>` (fokus och Esc).
- Ikonknappar har `aria-label`, timern och ändringar annonseras för skärmläsare (`aria-live`).
- Respekterar "minska rörelser" (`prefers-reduced-motion`).
- Text ska inte bero på färg ensam (status visas även med text och ikon).

### Vad som inte delas med AI
Claude Code används bara för att skriva och granska kod. Följande ska inte delas med AI-verktyget:
- Personuppgifter: namn, e-postadress, kontouppgifter eller annat som identifierar användaren. Appen frågar inte efter
  namn (funktionen togs bort) och skickar ingenting från enheten.
- Nycklar, lösenord och tokens. Appen använder inga, och `.env`-filer är ignorerade i `.gitignore`.
- Riktiga användares träningsdata. Under utveckling används bara påhittade testdata i webbläsaren.
- Material man inte har rätt att använda, till exempel licensierade bilder (se [sakerhet.md](sakerhet.md)).

Regeln finns också i [AGENTS.md](../AGENTS.md), som AI-verktyget läser.
