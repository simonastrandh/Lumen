# Spacing, radier och layout

## Avstånd
Tokens i `tokens.css`: `--space-1` 4 px, `--space-2` 8 px, `--space-3` 12 px, `--space-4` 16 px, `--space-5` 20 px,
`--space-6` 24 px, `--space-8` 32 px. Skalan följer 4 px-steg. De vanligaste värdena i komponenterna är 8, 12, 14, 16 och 22 px.

| Användning | Värde |
|---|---|
| Sidmarginal i sidled | 16–20 px (`clamp(16px, 5vw, 20px)`) |
| Överkant på sidan | minst 56 px (och hakets säkra yta) |
| Mellan sektioner | 22–36 px |
| Mellan rader i en lista | 12–16 px med en hårfin linje |
| Inuti kort | 16–20 px |
| Mellan knappar i en grupp | 10–12 px |

## Radier
| Token | Värde | Används till |
|---|---|---|
| `--radius-card` | 0 px | Kort och paneler (skarpa hörn) |
| `--radius-pill` | 2 px | Knappar, fält och taggar (nästan skarpa) |

## Layout
- **Mobil:** appen fyller hela bredden. Innehållet har fluida marginaler och tar hänsyn till hak och hemfält
  (`env(safe-area-inset-*)`).
- **Dator:** appen visas i en telefonram på `--frame-width` (390 px), högst 860 px hög. Paneler öppnas inuti ramen.
- **Maxbredd:** `--app-max-width` är 560 px, för till exempel liggande telefon.
- **Navigeringen:** menyn längst ner är 78 px hög (plus hemfält).
- **Aktivt pass:** hela skärmen ryms utan scroll när det går. Setlistan krymper först och därefter scrollar sidan.
- **Tryckytor:** knappar och reglage är i regel 40 px eller större.
