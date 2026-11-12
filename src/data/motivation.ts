// Motiverande rader för hemskärmen. En rad väljs per dag, så den känns ny varje dag
// men hoppar inte runt om man laddar om sidan.

export interface Motivation {
  /** Hela meningen */
  text: string
  /** Del av texten som lyfts fram i accentfärg (valfritt) */
  highlight?: string
}

const lines: Motivation[] = [
  { text: 'Varje rep räknas. Gör dagens till ett bra.', highlight: 'Varje rep räknas.' },
  { text: 'Starkare än igår – det är hela målet.', highlight: 'Starkare än igår' },
  { text: 'Disciplin slår motivation. Dyk upp ändå.', highlight: 'Dyk upp ändå.' },
  { text: 'Små ökningar blir stora resultat.', highlight: 'stora resultat' },
  { text: 'Kroppen klarar mer än huvudet tror.', highlight: 'mer än huvudet tror' },
  { text: 'Ett pass i taget. Ett kilo i taget.', highlight: 'Ett kilo i taget.' },
  { text: 'Du ångrar aldrig ett genomfört pass.', highlight: 'aldrig' },
  { text: 'Progression, inte perfektion.', highlight: 'Progression' },
]

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000)
}

/** Dagens motiverande citat (samma hela dagen). */
export function getDailyMotivation(date: Date): Motivation {
  return lines[dayOfYear(date) % lines.length]
}

/** Hälsning efter tid på dygnet. */
export function getTimeGreeting(date: Date): string {
  const h = date.getHours()
  if (h >= 5 && h < 10) return 'God morgon'
  if (h >= 10 && h < 17) return 'Hej'
  if (h >= 17 && h < 23) return 'God kväll'
  return 'Uppe sent'
}
