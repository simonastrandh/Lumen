// Typer och hjälpfunktioner för övningar. Alla övningar skapas av användaren (appen har inget inbyggt bibliotek).

export type MuscleGroup = 'Bröst' | 'Rygg' | 'Axlar' | 'Armar' | 'Ben' | 'Baksida lår' | 'Säte' | 'Mage' | 'Helkropp' | 'Kondition'
/** Styrka mäts i set × reps (+ vikt), kondition i tid och/eller distans. */
export type ExerciseKind = 'styrka' | 'kondition'
export type CardioMeasure = 'tid' | 'distans' | 'tid-distans'
/** Hur en styrkeövning mäts: alltid i set, sedan reps eller tid, med eller utan vikt */
export type StrengthPart = 'reps' | 'tid' | 'vikt'
/** Valfri kombination av reps, tid och vikt, alltid i ordningen reps-tid-vikt (t.ex. 'reps-vikt') */
export type StrengthMeasure = 'reps' | 'tid' | 'vikt' | 'reps-tid' | 'reps-vikt' | 'tid-vikt' | 'reps-tid-vikt'
export const strengthParts: StrengthPart[] = ['reps', 'tid', 'vikt']
export const strengthPartLabel: Record<StrengthPart, string> = { reps: 'Reps', tid: 'Tid', vikt: 'Vikt' }
export const partsOf = (m: StrengthMeasure | undefined): StrengthPart[] => strengthParts.filter((p) => (m ?? 'reps').split('-').includes(p))
/** Slå på/av en del; minst en måttenhet måste alltid vara vald */
export const toggledMeasure = (m: StrengthMeasure, p: StrengthPart): StrengthMeasure => {
  const cur = partsOf(m)
  const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
  return next.length ? measureFromParts(next) : m
}
export const measureFromParts = (parts: StrengthPart[]): StrengthMeasure => strengthParts.filter((p) => parts.includes(p)).join('-') as StrengthMeasure
export const cardioMeasureLabel: Record<CardioMeasure, string> = { tid: 'Tid', distans: 'Distans', 'tid-distans': 'Tid + distans' }
export type LoadType = 'kg' | 'kroppsvikt' | 'maskin'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  load: LoadType
  /** Saknas = styrka */
  kind?: ExerciseKind
  /** Bara för kondition: hur övningen mäts */
  measure?: CardioMeasure
  /** Bara för styrka: hur övningen mäts (saknas = reps) */
  strengthMeasure?: StrengthMeasure
  /** Användarens standardvärden när övningen läggs i ett pass */
  defaults?: ExerciseDefaults
}

export const isCardio = (e?: Exercise): boolean => e?.kind === 'kondition'

/** Användarens ändringar av hur en övning mäts  */
export interface ExerciseDefaults { rest?: number; sets?: number; reps?: number; kg?: number; seconds?: number; minutes?: number; km?: number }
export type MeasureOverride = Partial<Pick<Exercise, 'strengthMeasure' | 'measure'>> & { defaults?: ExerciseDefaults }
/** Lägger användarens ändringar (mått, standardvärden) ovanpå en övning */
export const withOverride = (e: Exercise, overrides: Record<string, MeasureOverride>): Exercise => (overrides[e.id] ? { ...e, ...overrides[e.id] } : e)

/** Hittar en övning med användarens ändringar. Ren funktion – state ligger i WorkoutStore. */
export function resolveExercise(id: string, list: Exercise[], overrides: Record<string, MeasureOverride>): Exercise | undefined {
  const base = list.find((e) => e.id === id)
  return base ? withOverride(base, overrides) : undefined
}


/** Mått där ett högre värde är ett personbästa (PB) */
export type PbMetric = 'kg' | 'reps' | 'seconds' | 'km'
export const pbMetrics: PbMetric[] = ['kg', 'reps', 'seconds', 'km']

export interface ExerciseStats {
  /** Bästa värdet hittills per mått */
  best: Partial<Record<PbMetric, number>>
  /** Bästa enskilda set hittills som en enhet, t.ex. 3 km på 20 min eller 8 reps med 20 kg */
  bestSet?: ExerciseDefaults
  /** Värdena från senaste pass (senaste gången övningen redigerades) */
  last?: { date: string; values: ExerciseDefaults }
  /** Senaste nya personbästa */
  lastPb?: { metrics: PbMetric[]; date: string }
}

/** Är set `a` bättre än set `b`? Distans, vikt, tid och reps väger tyngst i den ordningen; vid lika distans vinner kortare tid. */
export function isBetterSet(a: ExerciseDefaults, b?: ExerciseDefaults): boolean {
  if (!b) return true
  for (const k of ['km', 'kg', 'seconds', 'reps'] as const) {
    const x = a[k] ?? -1
    const y = b[k] ?? -1
    if (x !== y) return x > y
  }
  return (a.minutes ?? Infinity) < (b.minutes ?? Infinity)
}
