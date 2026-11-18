# Säkerhetsbeslut och risker

Varje beslut har en risk eller en stoppsignal som analyserades.

| Beslut | Risk eller stoppsignal | Analys | Slutsats |
|---|---|---|---|
| **All data sparas lokalt** (`localStorage`), ingen backend, inga konton | Träningsdata är personlig. En server skulle kräva inloggning, lagring och skydd av data | Utan server finns ingenting att läcka, men data försvinner om webbläsaren rensas | Behåll lokal lagring. Förlusten är ett dokumenterat val. "Rensa all data" och bekräftelser finns i appen |
| **Inga nycklar eller hemligheter i repot** | Repot är publikt. En nyckel skulle kunna missbrukas av vem som helst | Appen behöver inga nycklar. `.env` och lokala filer ignoreras i `.gitignore`. Spårade filer söktes igenom utan träff | Inga nycklar, och regeln står i [AGENTS.md](../AGENTS.md) |
| **Namnfältet togs bort** | Namn är en personuppgift som inte behövs för att logga träning | Mindre att skydda, och appen blir enklare | Appen sparar inget som identifierar användaren |
| **Pusha bara efter uttryckligt ja** | Ett push till `main` publicerar sidan direkt (GitHub Actions). AI kunde publicera ofärdigt arbete | Publicering är svår att ta tillbaka när sidan är indexerad | Regel i [AGENTS.md](../AGENTS.md): AI pushar aldrig utan att användaren sagt det |
| **Licensierad bild användes inte** | Referensbilden till handen kom från en tjänst med licens. Att kopiera den hade brutit mot upphovsrätten | Stoppsignal: det går inte att ta en bild utan rätt att använda den | Egen SVG ritades i stället, och handen togs senare bort |
| **Tvingad installation avbröts** | `npm install --legacy-peer-deps` kringgick ett versionsfel (ESLint stöder inte TypeScript 7). Att tvinga in paket som inte passar kan ge oförutsägbara fel och öppnar för osäkra beroenden | Nyttan (en linter) vägde inte upp risken | Installationen rullades tillbaka, `package.json` är oförändrad |
| **Historiken skyddades** | Git-historiken skrevs om en gång (en enda ny rot-commit) och kunde ha tappat arbete | En backup av hela den gamla historiken togs först | När någon redigerat README direkt på GitHub användes `rebase` så att deras ändring bevarades |
| **Bekräftelser före oåterkalleliga handlingar** | Användaren kunde tappa ett pågående pass eller en övning av misstag | Pågående pass skrivs inte över utan fråga, byte av övning med klara set frågar först, och "Ta bort" kräver bekräftelse | Inbyggt i appen (se `useStartGuard` och Ändra pass) |
| **Typsnitt från Google Fonts** | Webbläsaren hämtar Anton och Geist från Google, och då ser Google besökarens IP-adress | Ingen av appens data skickas dit, men det är en tredjepartsförfrågan | Accepteras för projektet. Vid riktig drift skulle typsnitten ligga i appens egen mapp |
| **E-post i commit-historiken** | Författarens e-postadress finns i alla commits i ett publikt repo | Inte i filerna, men synlig i historiken | Noterat. Framtida commits kan använda GitHubs `noreply`-adress. Äldre historik lämnas |

## Stoppsignaler som användes
- AI vill göra något som inte kan ångras (skriva över, forcera, publicera): stanna och fråga.
- AI föreslår att kringgå ett fel (`--force`, `--legacy-peer-deps`): ifrågasätt först, rulla tillbaka om det inte är motiverat.
- Något hämtas från en källa man inte har rätt till (bild, kod): använd det inte.
