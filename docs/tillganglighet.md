# Tillgänglighet

Mål: WCAG 2.1 AA. Texten ska ha minst 4,5:1 i kontrast och kanter och ikoner minst 3:1.

## Kontrast (uppmätt)
Förhållandet räknas med WCAG:s formel för relativ luminans på de färgvärden som finns i `src/styles/tokens.css`.

### Mörkt läge (mörkblått)
| Användning | Förgrund | Bakgrund | Kontrast | Krav |
|---|---|---|---|---|
| Primär text | `#e8eef2` | `#11161b` | 15,54:1 | 4,5:1 |
| Primär text på yta | `#e8eef2` | `#19212a` | 13,88:1 | 4,5:1 |
| Dämpad text | `#93a1ac` | `#11161b` | 6,87:1 | 4,5:1 |
| Dämpad text på yta | `#93a1ac` | `#19212a` | 6,14:1 | 4,5:1 |
| Accenttext (`--accent-ink`) | `#b8dc2a` | `#11161b` | 11,53:1 | 4,5:1 |
| Text på accentfyllning | `#0a0a0a` | `#b8dc2a` | 12,55:1 | 4,5:1 |
| Felfärg | `#ff6b5c` | `#11161b` | 6,51:1 | 4,5:1 |
| Kant på fält och knappar | `#71808c` | `#11161b` | 4,48:1 | 3:1 |

### Ljust läge (neon lime)
| Användning | Förgrund | Bakgrund | Kontrast | Krav |
|---|---|---|---|---|
| Primär text | `#0c1118` | `#f7f8fa` | 17,82:1 | 4,5:1 |
| Primär text på yta | `#0c1118` | `#eceef2` | 16,30:1 | 4,5:1 |
| Dämpad text | `#4d5866` | `#f7f8fa` | 6,81:1 | 4,5:1 |
| Dämpad text på yta | `#4d5866` | `#eceef2` | 6,23:1 | 4,5:1 |
| Accenttext (`--accent-ink`) | `#0c1118` | `#f7f8fa` | 17,82:1 | 4,5:1 |
| Text på accentfyllning | `#0a0a0a` | `#c6f432` | 15,45:1 | 4,5:1 |
| Felfärg | `#c4161c` | `#f7f8fa` | 5,68:1 | 4,5:1 |
| Kant på fält och knappar | `#7c8591` | `#f7f8fa` | 3,52:1 | 3:1 |

**Alla uppmätta par klarar WCAG AA.** Neon lime som *textfärg* på ljus bakgrund ger bara 1,21:1 och används därför aldrig
som text. Den används som fyllning med svart text, och accentfärgad text använder `--accent-ink` (lime i mörkt läge, svart i
ljust läge).

## Övrigt
- **Tangentbord:** alla knappar och hjul går att nå och styra. Hjul (vikt, tid) är `spinbutton` med piltangenter. Listor som
  går att sortera flyttas med piltangenter på greppet.
- **Fokus:** synlig fokusring (`:focus-visible`) i accentfärgen. Paneler är `<dialog>` med fokusfälla och Esc.
- **Skärmläsare:** ikonknappar har `aria-label` ("Starta Push", "Ta bort Bänkpress från passet"). Timern annonserar när vilan är
  slut och när ett set blir klart (`aria-live`). Felmeddelanden har `role="alert"`.
- **Rörelse:** `prefers-reduced-motion` stänger av animationer (välkomnande, utfällning vid vila, paneler, intoning).
- **Tryckytor:** knappar och reglage är i regel 40 px eller större (minsta ikonknappen är 35 px).
- **Stora siffror** krymper så att de alltid får plats på bredden (`useFitScale`), även vid långa tal som 1245,5 kg.

## Så mäts kontrasten igen
Värdena ovan räknades med WCAG-formeln i ett skript på färgerna i `tokens.css`. Ändras en färg ska tabellen räknas om.

## Känt och inte mätt
- Kontrast över bilder finns inte (appen har inga bilder).
- Ingen test med riktig skärmläsare (VoiceOver/TalkBack) har gjorts. Märkningen är gjord enligt standarden men inte provad.
