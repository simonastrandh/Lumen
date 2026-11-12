// Mål: typer och beräkning av hur nära målet man är.

/** kg = vikt, sek = tid (lagras i sekunder; äldre mål i 'min' konverteras), km = distans, reps = repetitioner */
export type GoalUnit = 'kg' | 'min' | 'sek' | 'km' | 'reps'
export const goalUnitMax: Record<GoalUnit, number> = { kg: 500, min: 600, sek: 36000, km: 500, reps: 1000 }
export const isTimeUnit = (u: GoalUnit) => u === 'sek' || u === 'min'

export interface GoalMetric {
  current: number
  /** Saknas = det här måttet är inte ett mål utan hålls som det är (t.ex. samma 3 km men på kortare tid) */
  target?: number
  /** Värdet när målet skapades. Behövs för att räkna ut hur långt man kommit, även när målet är att sänka ett värde (t.ex. tid). */
  start?: number
  unit: GoalUnit
}

/** Ett mål kopplat till en övning. Man väljer själv vilka mått som ska följas (vikt, reps, tid, distans): det första ligger i målet självt, övriga i `extras`. */
export interface Goal extends GoalMetric {
  id: string
  /** Övningens id (målet följer övningen även om den byter namn) */
  exerciseId?: string
  /** Övningens namn när målet skapades (visas om övningen inte längre finns) */
  exercise: string
  extras?: GoalMetric[]
  /** Äldre mål hade högst ett extra mått */
  extra?: GoalMetric
}

/** Alla mått i ett mål, det första först */
export const goalMetrics = (g: Goal): GoalMetric[] => [g, ...(g.extras ?? (g.extra ? [g.extra] : []))]

/** Äldre startmål (används bara för att städa bort det gamla exemplet) */
export const legacySeedGoals: Goal[] = [{ id: 'bench', exercise: 'Bänkpress', current: 80, target: 100, unit: 'kg' }]

/** Mått i sekunder/enhet som jämförs (äldre minutmål räknas om) */
const norm = (m: GoalMetric, v: number) => (m.unit === 'min' ? v * 60 : v)

/**
 * Hur nära målet man är för ETT mått, 0–1 (andel av målet som är uppnått):
 *  - mål högre än start (mer vikt, längre sträcka, längre tid):  nu / mål      – 3 av 5 km = 60 %
 *  - mål lägre än start (snabbare tid):                         mål / nu      – mål 15 min, nu 20 min = 75 %
 * Startvärdet används bara för att avgöra åt vilket håll målet ligger.
 */
export function metricProgress(m: GoalMetric): number | null {
  if (m.target === undefined) return null
  const target = norm(m, m.target)
  const cur = norm(m, m.current)
  if (target <= 0 || cur <= 0) return cur >= target ? 1 : 0
  const lowerIsBetter = m.start !== undefined && target < norm(m, m.start)
  const p = lowerIsBetter ? target / cur : cur / target
  return Math.max(0, Math.min(1, p))
}

/** Samlad procent för ett mål med flera mått: genomsnittet av de mått som är mål (de du lämnat tomma räknas inte). */
export function goalProgress(g: Goal): number {
  const parts = goalMetrics(g).map(metricProgress).filter((p): p is number => p !== null)
  return parts.length ? (parts.reduce((a, b) => a + b, 0) / parts.length) * 100 : 0
}
