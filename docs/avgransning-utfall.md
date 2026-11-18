# Avgränsningen: höll den?

Jämförelse mellan planen ([prioritering.md](prioritering.md)) och slutprodukten. Avvikelser är markerade och förklarade.

## Det som byggdes enligt planen
| Plan | Utfall |
|---|---|
| Skapa pass och övningar | Klart. Appen börjar tom och användaren skapar allt själv |
| Logga vikt och reps | Klart, och även tid och distans (kondition) |
| Statistik och graf per övning | Klart (Statistik med flikar och stapeldiagram per månad) |
| Vilotimer | Klart, och senare med Pausa och ±30 s |
| Gym-vänligt UI | Klart: stora ytor, hög kontrast, hjul i stället för tangentbord |
| Personliga rekord | Klart, räknas som bästa *set* så att vikt och reps hör ihop |
| Lokal lagring (ingen databas) | Klart, `localStorage` |
| Publicering före presentation | Klart, GitHub Pages |

## Avvikelser som upptäcktes och hanterades
1. **Scope växte med funktioner som inte stod i planen.** Mål med procent, rotation av pass, konditionspass,
   "Ändra pass" mitt i ett pass och kg/lb byggdes. *Hantering:* de lades bara till efter att MVP fungerade, och varje ny
   funktion fick ett beslut i [beslutslogg.md](beslutslogg.md). Enhetsvalet (kg/lb) hade först avgränsats bort eftersom
   det kräver omräkning. Det löstes genom att allt sparas i kg och km och bara visningen räknas om, så det blev billigt.
2. **Designen byttes flera gånger.** Flera stilar provades (neon med glas, krom, Verkstad × Tidning, affisch och slutligen Nike-affisch).
   Det kostade mest tid av allt. *Hantering:* varianter jämfördes i Figma före kod, och slutligt val gjordes av
   användaren. Gamla varianter finns kvar i git-historiken. Lärdom: bestäm stilen före bygget, inte efter.
3. **Dekor som drog över gränsen och togs bort.** En levande bakgrund med partiklar och en 3D-hand runt telefonramen
   byggdes och togs sedan bort. *Hantering:* de gjorde ingenting för kärnproblemet (logga progression) och tog tid.
4. **Inbyggt övningsbibliotek togs bort.** Det fanns kvar i bakgrunden trots att det inte syntes. *Hantering:* borttaget
   och data som använde det omvandlades av en migrering. Se [ai-fel.md](ai-fel.md).
5. **Namnfält och "animerad bakgrund" togs bort.** Namnet behövdes inte, och att inte spara det är också mindre
   personuppgifter att hantera (se [sakerhet.md](sakerhet.md)).

## Det som avgränsades bort och inte byggdes
Progressive overload-förslag, kroppskarta, export till PDF/CSV, offline/PWA, röstinmatning, platträknare, sociala funktioner,
TikTok-länkar och inloggning. Skälen finns i [prioritering.md](prioritering.md). Export togs också bort ur
Inställningar (fanns i en tidig plan) eftersom det inte hann prioriteras.

## Slutsats
Kärnan (MVP) blev klar tidigt och avgränsningen höll för det som är svårt (konto, backend, sociala funktioner). Det som
sprack var avgränsningen av *design och extra funktioner* som växte efter MVP. De hanterades genom att dokumenteras och
sedan antingen behållas med motivering eller tas bort.
