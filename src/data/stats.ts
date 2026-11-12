import type { CompletedWorkout } from '../store/WorkoutStore'
import type { ExerciseDefaults, ExerciseStats } from './exercises'
import { goalMetrics, type Goal, type GoalMetric, type GoalUnit } from './goals'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']

/** Antal avslutade pass per månad för de senaste `n` månaderna (äldst först) */
export function workoutsPerMonth(history: CompletedWorkout[], n = 6, today = new Date()) {
  const out: { label: string; value: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const value = history.filter((h) => {
      const c = new Date(h.completedAt)
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth()
    }).length
    out.push({ label: MONTHS[d.getMonth()], value })
  }
  return out
}

export const workoutsThisMonth = (history: CompletedWorkout[], today = new Date()) =>
  history.filter((h) => {
    const c = new Date(h.completedAt)
    return c.getFullYear() === today.getFullYear() && c.getMonth() === today.getMonth()
  }).length

export const totalSeconds = (history: CompletedWorkout[]) => history.reduce((s, h) => s + (h.durationSeconds ?? 0), 0)
export const totalVolume = (history: CompletedWorkout[]) => history.reduce((s, h) => s + (h.volume ?? 0), 0)

// ——— Längre statistik: veckor i rad, styrkeökning, per övning ———


const WEEK = 7 * 24 * 3600 * 1000
/** Måndag 00:00 för veckan som datumet ligger i */
const weekStart = (d: Date) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x.getTime()
}

/** Antal veckor i rad med minst ett pass. Räknar från denna vecka, eller förra veckan om man inte tränat än denna vecka. */
export function weeksInRow(history: CompletedWorkout[], today = new Date()): number {
  const weeks = new Set(history.map((h) => weekStart(new Date(h.completedAt))))
  let w = weekStart(today)
  if (!weeks.has(w)) w -= WEEK
  let n = 0
  while (weeks.has(w)) {
    n++
    w -= WEEK
  }
  return n
}

export type StatMetric = 'kg' | 'km' | 'seconds' | 'reps'
export const metricUnit: Record<StatMetric, string> = { kg: 'kg', km: 'km', seconds: 's', reps: 'reps' }

/** Vilket mått som beskriver framsteg för en övning: vikt, annars distans, tid, reps */
export function primaryMetric(sets: ExerciseDefaults[]): StatMetric {
  if (sets.some((s) => s.kg !== undefined)) return 'kg'
  if (sets.some((s) => s.km !== undefined)) return 'km'
  if (sets.some((s) => s.seconds !== undefined)) return 'seconds'
  return 'reps'
}

const sessionsOf = (history: CompletedWorkout[], exerciseId: string) =>
  history.flatMap((h) => {
    const e = h.exercises?.find((x) => x.exerciseId === exerciseId)
    return e && e.sets.length ? [{ date: h.completedAt, sets: e.sets }] : []
  })

const bestOf = (sets: ExerciseDefaults[], m: StatMetric) => Math.max(0, ...sets.map((s) => s[m] ?? 0))

/** Alla övningar som finns i historiken, med namn */
export function loggedExercises(history: CompletedWorkout[]): { id: string; name: string }[] {
  const seen = new Map<string, string>()
  for (const h of history) for (const e of h.exercises ?? []) seen.set(e.exerciseId, e.name)
  return [...seen].map(([id, name]) => ({ id, name }))
}

export interface ExerciseSummary {
  metric: StatMetric
  /** Bästa värdet, snittet av varje pass bästa värde, och antal pass */
  best: number
  average: number
  sessions: number
  /** Bästa värdet per månad, senaste n månaderna */
  monthly: { label: string; value: number }[]
  /** Förändring senaste månaden med data jämfört med föregående månad med data, i procent */
  change: number | null
}

export function exerciseSummary(history: CompletedWorkout[], exerciseId: string, n = 6, today = new Date()): ExerciseSummary | null {
  const sessions = sessionsOf(history, exerciseId)
  if (sessions.length === 0) return null
  const metric = primaryMetric(sessions.flatMap((s) => s.sets))
  const values = sessions.map((s) => bestOf(s.sets, metric))
  const monthly: { label: string; value: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const inMonth = sessions.filter((s) => {
      const c = new Date(s.date)
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth()
    })
    monthly.push({ label: MONTHS[d.getMonth()], value: Math.max(0, ...inMonth.map((s) => bestOf(s.sets, metric))) })
  }
  const withData = monthly.filter((m) => m.value > 0)
  const change = withData.length >= 2 ? ((withData[withData.length - 1].value - withData[withData.length - 2].value) / withData[withData.length - 2].value) * 100 : null
  return { metric, best: Math.max(...values), average: values.reduce((a, b) => a + b, 0) / values.length, sessions: sessions.length, monthly, change }
}

export interface Increase { exerciseId: string; name: string; from: number; to: number; date: string }

/** Varje gång man lyft tyngre än tidigare i en övning, nyast först */
export function strengthIncreases(history: CompletedWorkout[]): Increase[] {
  const best = new Map<string, number>()
  const out: Increase[] = []
  for (const h of history) {
    for (const e of h.exercises ?? []) {
      const kg = bestOf(e.sets, 'kg')
      if (kg <= 0) continue
      const prev = best.get(e.exerciseId)
      if (prev !== undefined && kg > prev) out.push({ exerciseId: e.exerciseId, name: e.name, from: prev, to: kg, date: h.completedAt })
      best.set(e.exerciseId, Math.max(prev ?? 0, kg))
    }
  }
  return out.reverse()
}

/** Genomsnittlig ökning i vikt sedan första loggade passet, över alla övningar med vikt och minst två pass. Null om det inte går att räkna. */
export function averageStrengthIncrease(history: CompletedWorkout[]): number | null {
  const ids = loggedExercises(history).map((e) => e.id)
  const pcts: number[] = []
  for (const id of ids) {
    const s = sessionsOf(history, id).map((x) => bestOf(x.sets, 'kg')).filter((v) => v > 0)
    if (s.length >= 2) pcts.push(((Math.max(...s) - s[0]) / s[0]) * 100)
  }
  return pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null
}

/** "idag", "igår", "för 4 dagar sedan", "för 2 veckor sedan" */
export function ago(iso: string, now = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / (24 * 3600 * 1000))
  if (days <= 0) return 'idag'
  if (days === 1) return 'igår'
  if (days < 7) return `för ${days} dagar sedan`
  if (days < 30) return `för ${Math.floor(days / 7)} ${Math.floor(days / 7) === 1 ? 'vecka' : 'veckor'} sedan`
  return `för ${Math.floor(days / 30)} ${Math.floor(days / 30) === 1 ? 'månad' : 'månader'} sedan`
}

// ——— Mål som följer det man faktiskt gjort ———

/** Nuvarande värde för ett mått, hämtat från bästa utförda värde. Undefined om övningen inte har något loggat. */
export function autoCurrent(unit: GoalUnit, stats?: ExerciseStats): number | undefined {
  if (!stats) return undefined
  switch (unit) {
    case 'kg': return stats.best.kg
    case 'reps': return stats.best.reps
    case 'km': return stats.best.km
    case 'sek':
    case 'min': {
      // Konditionspass: tiden i det bästa setet. Styrka: längsta tid.
      const secs = stats.bestSet?.minutes !== undefined ? stats.bestSet.minutes * 60 : stats.best.seconds
      return secs === undefined ? undefined : unit === 'min' ? secs / 60 : secs
    }
  }
}

/** Ett mål där "nuvarande" följer personbästa/senaste bästa värde när det finns, annars det inskrivna. */
export function effectiveGoal(goal: Goal, stats?: ExerciseStats): Goal {
  const fix = <T extends GoalMetric>(m: T): T => ({ ...m, current: autoCurrent(m.unit, stats) ?? m.current })
  const rest = goalMetrics(goal).slice(1).map(fix)
  return { ...fix(goal), extras: rest.length ? rest : undefined, extra: undefined }
}
