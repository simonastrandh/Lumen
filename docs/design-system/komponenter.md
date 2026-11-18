# Komponenter

Återanvändbara delar finns i `src/components/`. Skärmspecifika delar ligger bredvid sin skärm i `src/screens/`.

## UI (`components/ui`)
| Komponent | Syfte | Varianter och viktiga egenskaper |
|---|---|---|
| `Button` | Alla knappar | `primary` (accentfylld huvudhandling), `secondary` (kontur), `tonal` (ytfärgad kontur), `ghost` (liten och diskret). `icon`, `fullWidth` |
| `Card` | Platt kort med hårfin kant | Används t.ex. i startguiden |
| `Tag` | Liten etikett | `neutral` (kontur), `highlight` (accentfylld, för PB och "Nästa") |
| `IconBadge` | Rund ikonruta | `icon`, `size` |
| `TextField` | Textfält med etikett och felmeddelande | `label`, `error` |
| `SearchField` | Sökfält | `value`, `onChange`, `label` |
| `SegmentedControl` | Val mellan få alternativ (t.ex. Mörkt/Ljust, Styrka/Kondition) | `options`, `value`, `label` |
| `Toggle` | Av/på-reglage | `checked`, `label` |
| `BottomSheet` | Panel som glider upp (`<dialog>`) | `title`, `open`, glider ut vid stängning |
| `SortableList` | Lista som går att sortera med drag eller piltangenter | `items`, `onReorder`, `sortable` |
| `ProgressRing` | Ring som visar tid kvar | `value`, `size`, `label` |
| `BarChart` | Stapeldiagram per månad | `data`, `label`, `unit` |
| `Icon` | SVG-ikon | `name`, `size` (se [ikoner.md](ikoner.md)) |

## Väljare (`components/pickers`)
| Komponent | Syfte |
|---|---|
| `WheelPicker` / `WheelField` | Hjul för tal (set, reps, vikt) |
| `TimeField` / `TimeWheel` | Tid (tim, min, sek) |
| `MeasureFields` | Rätt hjul för en övning (set, reps, vikt, tid, distans, vila) |
| `ExercisePicker` | Sökbar rullgardin för att välja övning |

## Layout (`components/layout`)
| Komponent | Syfte |
|---|---|
| `AppShell` | Ram runt alla skärmar. På dator visas appen i en telefonram |
| `BottomNav` | Menyn längst ner (Hem, Pass, Statistik, Inställningar) |
| `Welcome` | Välkomstskärmen med stora LUMEN |

## Mönster som återkommer
- **Gult kort med spelknapp** (`Nästa pass` på Hem, passöversikten): accentfylld yta, Anton-rubrik och en mörk ruta med
  spelikon.
- **Panel för val och bekräftelse:** `BottomSheet` med rubrik i Anton, förklarande text och en primär och en sekundär knapp.
- **Rad med Starta-knapp:** lista där varje rad har en `Starta`-knapp till höger (pass och övningar).
- **Utfällning:** innehåll som kommer och går fälls ut med höjdövergång och toning, inte med hopp.
