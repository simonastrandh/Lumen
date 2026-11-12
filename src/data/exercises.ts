// Övningsbibliotek: vanliga övningar som känns igen när man skriver ett namn. Varje övning har en belastningstyp
// så att jämförelser inte blandar ihop kg, kroppsvikt och maskinnivåer.

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
  /** Egen övning som användaren skrivit in själv */
  custom?: boolean
}

export const isCardio = (e?: Exercise): boolean => e?.kind === 'kondition'

export const exercises: Exercise[] = [
  { id: 'bench-press', name: 'Bänkpress', muscleGroup: 'Bröst', load: 'kg' },
  { id: 'incline-db-press', name: 'Lutande hantelpress', muscleGroup: 'Bröst', load: 'kg' },
  { id: 'cable-fly', name: 'Cable flyes', muscleGroup: 'Bröst', load: 'maskin' },
  { id: 'dips', name: 'Dips', muscleGroup: 'Bröst', load: 'kroppsvikt' },
  { id: 'shoulder-press', name: 'Axelpress', muscleGroup: 'Axlar', load: 'kg' },
  { id: 'lateral-raise', name: 'Sidolyft', muscleGroup: 'Axlar', load: 'kg' },
  { id: 'face-pull', name: 'Face pulls', muscleGroup: 'Axlar', load: 'maskin' },
  { id: 'tricep-pushdown', name: 'Tricep pushdown', muscleGroup: 'Armar', load: 'maskin' },
  { id: 'bicep-curl', name: 'Bicepscurl', muscleGroup: 'Armar', load: 'kg' },
  { id: 'hammer-curl', name: 'Hammercurl', muscleGroup: 'Armar', load: 'kg' },
  { id: 'deadlift', name: 'Marklyft', muscleGroup: 'Rygg', load: 'kg' },
  { id: 'pull-up', name: 'Chins', muscleGroup: 'Rygg', load: 'kroppsvikt' },
  { id: 'lat-pulldown', name: 'Latsdrag', muscleGroup: 'Rygg', load: 'maskin' },
  { id: 'barbell-row', name: 'Skivstångsrodd', muscleGroup: 'Rygg', load: 'kg' },
  { id: 'seated-row', name: 'Sittande rodd', muscleGroup: 'Rygg', load: 'maskin' },
  { id: 'squat', name: 'Knäböj', muscleGroup: 'Ben', load: 'kg' },
  { id: 'leg-press', name: 'Benpress', muscleGroup: 'Ben', load: 'maskin' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian split squat', muscleGroup: 'Ben', load: 'kg' },
  { id: 'leg-extension', name: 'Benspark', muscleGroup: 'Ben', load: 'maskin' },
  { id: 'romanian-deadlift', name: 'Rumänsk marklyft', muscleGroup: 'Baksida lår', load: 'kg' },
  { id: 'leg-curl', name: 'Lårcurl', muscleGroup: 'Baksida lår', load: 'maskin' },
  { id: 'hip-thrust', name: 'Hip thrust', muscleGroup: 'Säte', load: 'kg' },
  { id: 'calf-raise', name: 'Tåhävningar', muscleGroup: 'Ben', load: 'maskin' },
  { id: 'plank', name: 'Plankan', muscleGroup: 'Mage', load: 'kroppsvikt' },
  { id: 'hanging-leg-raise', name: 'Hängande benlyft', muscleGroup: 'Mage', load: 'kroppsvikt' },
  { id: 'running', name: 'Löpning', muscleGroup: 'Kondition', load: 'kroppsvikt', kind: 'kondition', measure: 'tid-distans' },
  { id: 'cycling', name: 'Cykling', muscleGroup: 'Kondition', load: 'maskin', kind: 'kondition', measure: 'tid-distans' },
  { id: 'rowing-machine', name: 'Roddmaskin', muscleGroup: 'Kondition', load: 'maskin', kind: 'kondition', measure: 'tid-distans' },
  { id: 'walking', name: 'Promenad', muscleGroup: 'Kondition', load: 'kroppsvikt', kind: 'kondition', measure: 'tid' },
  { id: 'swimming', name: 'Simning', muscleGroup: 'Kondition', load: 'kroppsvikt', kind: 'kondition', measure: 'distans' },
  { id: 'jump-rope', name: 'Hopprep', muscleGroup: 'Kondition', load: 'kroppsvikt', kind: 'kondition', measure: 'tid' },
]

const byId = new Map(exercises.map((e) => [e.id, e]))
/** Användarens ändringar av hur en övning mäts (gäller även bibliotekets övningar) */
export interface ExerciseDefaults { rest?: number; sets?: number; reps?: number; kg?: number; seconds?: number; minutes?: number; km?: number }
export type MeasureOverride = Partial<Pick<Exercise, 'strengthMeasure' | 'measure'>> & { defaults?: ExerciseDefaults }
/** Lägger användarens ändringar (mått, standardvärden) ovanpå en övning */
export const withOverride = (e: Exercise, overrides: Record<string, MeasureOverride>): Exercise => (overrides[e.id] ? { ...e, ...overrides[e.id] } : e)

/** Hittar en övning (bibliotek eller egen) med användarens ändringar. Ren funktion – state ligger i WorkoutStore. */
export function resolveExercise(id: string, custom: Exercise[], overrides: Record<string, MeasureOverride>): Exercise | undefined {
  const base = byId.get(id) ?? custom.find((e) => e.id === id)
  return base ? withOverride(base, overrides) : undefined
}

export const loadLabel: Record<LoadType, string> = {
  kg: 'Fria vikter',
  kroppsvikt: 'Kroppsvikt',
  maskin: 'Maskin',
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
