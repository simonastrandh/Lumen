# Ikoner

Ikonerna är egna SVG-banor i `src/components/ui/Icon.tsx`. Ingen ikonfont och inget ikonbibliotek används, vilket
sparar vikt (se [../brief.md](../brief.md)).

## Regler
- Rutnät: `viewBox="0 0 24 24"`, standardstorlek 22 px (24 px i menyn, 16–18 px i knappar).
- Linjeikoner: `stroke="currentColor"`, linjebredd 1,5, runda ändar och hörn, ingen fyllning. Färgen ärvs av texten.
- Dekorativa ikoner är dolda för skärmläsare (`aria-hidden`). Knappar som bara har en ikon har `aria-label`.
- En ikon har en betydelse. Pass och övningar har olika ikoner så att de skiljs åt.

## Uppsättning
| Grupp | Ikoner |
|---|---|
| Navigering | `home`, `workout` (hantel, Pass), `stats` (graf), `settings`, `chevronLeft`, `chevronRight`, `arrowRight` |
| Handlingar | `plus`, `minus`, `check`, `close`, `edit` (penna), `trash`, `search`, `grip` (drag), `play`, `pause`, `flag` |
| Innehåll | `layers` (styrkepass), `stopwatch` (konditionspass), `bolt` (konditionsövning), `workout` (styrkeövning), `repeat` (rotation) |
| Information | `clock`, `trendUp` |

## Pass och övningar
| Typ | Ikon |
|---|---|
| Styrkeövning | `workout` (hantel) |
| Konditionsövning | `bolt` (blixt) |
| Styrkepass | `layers` (staplade lager) |
| Konditionspass | `stopwatch` (stoppur) |
