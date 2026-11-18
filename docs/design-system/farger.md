# Färger

Alla färger är CSS-variabler i `src/styles/tokens.css`. Temat sätts med `data-theme="dark" | "light"` på `<html>`.

## Roller
| Token | Mörkt läge | Ljust läge | Används till |
|---|---|---|---|
| `--page-bg` | `#11161b` | `#f7f8fa` | Sidans bakgrund |
| `--surface-bg` | `#19212a` | `#eceef2` | Kort, rader och paneler |
| `--surface-border` | `#2b3641` | `#d6dae1` | Hårfina linjer mellan rader och runt kort |
| `--field-border` | `#71808c` | `#7c8591` | Kanter på fält och knappar (minst 3:1) |
| `--input-bg` | `#11161b` | `#f7f8fa` | Bakgrund i fält |
| `--text-primary` | `#e8eef2` | `#0c1118` | Brödtext och rubriker |
| `--text-secondary` | `#93a1ac` | `#4d5866` | Dämpad text, etiketter |
| `--accent` | `#b8dc2a` | `#c6f432` | **Fyllning:** knappar, valda val, bockar |
| `--accent-text` | `#0a0a0a` | `#0a0a0a` | Text på accentfyllning |
| `--accent-ink` | `#b8dc2a` | `#0c1118` | **Accentfärgad text, ikoner och grafik** på bakgrund |
| `--danger` | `#ff6b5c` | `#c4161c` | Fel och destruktiva handlingar |

## Regler
- **Mörkt läge** är mörkblått (`#11161b`). **Ljust läge** är en ljus yta med neon lime som accent.
- **Neon lime används som fyllning med svart text, aldrig som textfärg på ljus bakgrund.** Kontrasten är då bara 1,21:1.
  Därför finns `--accent-ink` (lime i mörkt läge, svart i ljust läge) för accentfärgad text och ikoner.
- En accentfärg räcker. Status visas med text och ikon, inte med färg ensam.
- Felfärg används bara för fel och för att ta bort något.
- Kontrastvärden för alla par finns i [../tillganglighet.md](../tillganglighet.md).
