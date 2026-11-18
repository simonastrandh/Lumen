# Frågor & svar som dykt upp under planeringen

## Ska appen fungera offline på gymmet (ofta dåligt wifi)?
Ja – bygg som enkel PWA som cachar senaste pass lokalt och synkar när nätet är tillbaka.
Annars tappar du loggning i precis det ögonblick det spelar roll.

## Hur loggar man snabbt mitt i ett set utan att tappa fokus?
Stora +/- knappar istället för tangentbord, föreslagna standardvikter/reps baserat på
senaste gången, max 2–3 tryck per loggad set.

## Behövs inloggning/konto?
Trade-off: utan konto tappas historiken om cache rensas eller man byter enhet; med
konto krävs mer backend-arbete. För 2 veckor: enkel lösning (t.ex. e-post/magic link)
som "nice to have", inte MVP.

## Hur hanteras olika övningstyper (fria vikter vs kroppsvikt vs maskin med nivåer)?
Datamodellen behöver skilja på vikt-typ per övning – annars blir grafer/jämförelser
missvisande (0 kg i kroppsviktövning ≠ 0 kg i bänkpress).

## Vad händer vid orimlig inmatning (t.ex. 1000 kg av misstag)?
Enkel rimlighetskontroll/validering innan datan sparas, med tydligt felmeddelande
istället för att tyst spara fel data.

## Bör sociala funktioner (dela pass, följa vänner) finnas med?
Nej – avstyrks. Hög scope-risk för liten vinst på 2 veckor. Bättre som
"skulle kunna byggas vidare"-punkt i rapporten än som faktisk funktion.

## Måste AI ha en roll i appen utöver att koda den?
Nej. Uppgiften kräver AI som verktyg i byggprocessen (Claude Code), inte att
produkten måste ha en AI-funktion inbyggd. Se [ai-roll.md](ai-roll.md) för detaljer.
