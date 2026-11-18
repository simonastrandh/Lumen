# Prioritering

Resultat av prioriteringsmatrisen (effekt vs. insats) i Figma, kombinerat med ursprunglig
Must have / Nice to have-uppdelning.

## Must have (MVP – krävs för en fungerande app)
- Skapa pass och skriva in övningar som tillhör passet
- Logga vikt (kg) och reps per övning
- Se statistik över tid + graf per övning
- **Snabba vinster** (hög effekt, låg insats):
  - Vilotimer mellan set
  - Återanvänd senaste pass som mall
  - Gym-vänligt UI (stora tap-ytor, hög kontrast)

## Bör ha, om tiden räcker (stora satsningar – hög effekt, hög insats)
- Personliga rekord (PR) – upptäcks automatiskt när ett tidigare max slås
- Progressive overload-förslag – föreslår nästa vikt baserat på föregående pass
  (t.ex. +2,5 kg om du klarade alla reps förra gången)
- Kroppskarta – klicka på muskelgrupp för att se tränade/missade övningar

## Låg prioritet (trevligt men inte kritiskt)
- Export till PDF/CSV för att dela statistik med PT eller tränarkompis
- Offline-first/PWA för användning på gym med dåligt wifi – nice to have, inte MVP på 2 veckor

## Avgränsat bort (medvetna beslut)
- **Röstinmatning** – placerad i "undvik" trots att det är en kul AI-vinkel. Tal-till-text
  lägger till teknisk komplexitet (mikrofonbehörighet, bakgrundsljud på gym, felkänning av
  siffror) som inte står i proportion till nyttan på 2 veckor.
- **Platträknare** – också i "undvik". Enkel logik men låg koppling till kärnproblemet
  (logga progression). Byggs bara om allt annat är klart i förtid.
- **Sociala funktioner** (dela pass, följa vänner) – avstås helt. Hög scope-risk
  (relationer, flöden, notiser) för liten vinst på 2 veckor. Noteras som möjlig
  vidareutveckling i rapporten, byggs inte.
- **Länk till TikTok-tutorials** – TikTok har inget öppet API för videoinnehåll.
  Avgränsas till en enkel söklänk (tiktok.com/search?q=...), ingen djuplänk till
  specifik video (odokumenterat och inte garanterat att fungera).
- **Inloggning/konto** – inte MVP. Utan konto tappas historik vid rensad cache/nytt
  enhet, men backend-arbetet för ett riktigt konto bedöms kosta mer tid än det ger
  på 2 veckor.
