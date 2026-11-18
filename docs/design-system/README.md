# Designsystem

Lumens utseende är dokumenterat i fem delar. Allt utgår från designtokens i `src/styles/tokens.css`, som är enda källan
för färger, avstånd, radier och typsnitt. Komponenterna använder bara tokens, aldrig egna värden.

| Del | Fil | Innehåll |
|---|---|---|
| Färger | [farger.md](farger.md) | Paletter för mörkt och ljust läge, roller och regler |
| Typografi | [typografi.md](typografi.md) | Typsnitt, storlekar och användning |
| Komponenter | [komponenter.md](komponenter.md) | Återanvändbara delar och när de används |
| Ikoner | [ikoner.md](ikoner.md) | Ikonuppsättning och regler |
| Spacing | [spacing.md](spacing.md) | Avstånd, radier och layout |

## Principer
1. **Affischstil:** en yta, en accentfärg, stora versala rubriker och siffror, och tyst text. Varje skärm har *en hög röst*
   (en stor siffra eller ett stort ord).
2. **Platt:** skarpa hörn, hårfina linjer, inga skuggor och inget glas. Djup visas med linjer och färgblock.
3. **Tema:** mörkt (mörkblått, standard) och ljust (neon lime) läge, valbart i Inställningar via `data-theme` på `<html>`.
4. **Gym-vänlig:** stora tryckytor, hög kontrast och hjul i stället för tangentbord.

Skisserna finns i Figma (sidan "Lugn – Nike-känsla"), se [README.md](../../README.md).
