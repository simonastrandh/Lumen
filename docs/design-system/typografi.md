# Typografi

## Typsnitt
| Token | Typsnitt | Används till |
|---|---|---|
| `--font-display` | **Anton** (versaler) | Rubriker, stora siffror, passnamn, enheter (KG, REPS, PASS) |
| `--font-sans` | **Geist** (400, 500, 600, 700) | All övrig text: etiketter, knappar, listor, fält |

Båda hämtas från Google Fonts (se `index.html`). Reservtypsnitt: `system-ui` respektive `Impact`.

## Storlekar
Tokens i `tokens.css`: `--fs-caption` 12 px, `--fs-body` 14 px, `--fs-h3` 18 px, `--fs-h2` 22 px, `--fs-h1` 28 px.

| Roll | Typsnitt | Storlek | Exempel |
|---|---|---|---|
| Affischsiffra | Anton | 110–220 px (skalas med skärmen och krymper vid långa tal) | "2 PASS" på Hem, "10 REPS" i aktivt pass |
| Affischrubrik | Anton | 40–56 px | Passets namn i kortet "Nästa pass" |
| Panelrubrik | Anton | 30 px | "ÄNDRA PASS" |
| Sektionsrubrik | Geist 600 | 16–18 px | "Mina pass", "Mina mål" |
| Brödtext | Geist 400–500 | 14–15 px | Listor, beskrivningar |
| Etikett och hjälptext | Geist 500–600 | 12–13 px | "Pass denna månad", metarader |
| Liten etikett | Geist 600 | 11 px | Taggar (PB, Nytt) |

## Regler
- Anton används alltid i versaler (`text-transform: uppercase`) och med radavstånd på minst 1,2 så att Å, Ä och Ö får
  plats utan att krocka med raden ovanför.
- Siffror som ändras (timer, vikt) använder `font-variant-numeric: tabular-nums` så att de inte hoppar i sidled.
- Stora siffror anpassas till bredden med `useFitScale` så att inget bryts eller klipps.
- Rubriker är korta. Förklaringar ligger i dämpad text under.
