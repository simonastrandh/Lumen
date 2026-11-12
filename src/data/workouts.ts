import type { IconName } from '../components/ui/Icon'
import { partsOf, type Exercise } from './exercises'

// Pass: ett pass är en lista övningar med planerade värden.

export interface WorkoutExercise {
  exerciseId: string
  /** Styrka: antal set. Kondition: alltid 1. */
  sets: number
  reps: number
  /** Styrka, valfritt: planerad vikt (kg) och tid per set (sekunder), t.ex. för plankan */
  kg?: number
  seconds?: number
  /** Kondition: målt tid (minuter) och/eller distans (km) */
  minutes?: number
  km?: number
}

export interface Workout {
  id: string
  name: string
  /** Styrkepass eller konditionspass (saknas = styrka) */
  kind?: 'styrka' | 'kondition'
  exercises: WorkoutExercise[]
}

const ex = (exerciseId: string, sets: number, reps: number): WorkoutExercise => ({ exerciseId, sets, reps })

/** Gamla startpass (Push/Pull/Ben). Används bara av migreringen som städar bort dem. */
export const legacySeedWorkouts: Workout[] = [
  {
    id: 'push',
    name: 'Push',
    exercises: [ex('bench-press', 4, 8), ex('shoulder-press', 3, 10), ex('incline-db-press', 3, 10), ex('lateral-raise', 3, 12), ex('tricep-pushdown', 4, 12)],
  },
  {
    id: 'pull',
    name: 'Pull',
    exercises: [ex('deadlift', 3, 5), ex('pull-up', 4, 8), ex('barbell-row', 3, 10), ex('bicep-curl', 3, 12)],
  },
  {
    id: 'legs',
    name: 'Ben',
    exercises: [ex('squat', 4, 8), ex('romanian-deadlift', 3, 10), ex('leg-press', 3, 12), ex('leg-curl', 3, 12), ex('calf-raise', 4, 15), ex('hanging-leg-raise', 3, 12)],
  },
]

/** Förslag på nya pass */
/** Ungefärlig tid för ett pass (≈ 2,5 min per set inkl. vila) */
export function estimateMinutes(workout: Workout): number {
  const min = workout.exercises.reduce((sum, e) => sum + (e.minutes ?? e.sets * 2.5), 0)
  return Math.max(10, Math.round(min / 5) * 5)
}

/** Styrkepass har en skivstång som ikon, konditionspass en blixt */
export function workoutIcon(workout?: Workout): IconName {
  return workout?.kind === 'kondition' ? 'bolt' : 'workout'
}

/** Ny rad i ett pass utifrån övningens mått och standardvärden (set, reps, vikt, tid, distans) */
export function entryForExercise(exerciseId: string, e?: Exercise): WorkoutExercise {
  const d = e?.defaults ?? {}
  if (e?.kind === 'kondition') {
    return { exerciseId, sets: 1, reps: 0, minutes: e.measure !== 'distans' ? (d.minutes ?? 20) : undefined, km: e.measure !== 'tid' ? (d.km ?? 3) : undefined }
  }
  const m = e?.strengthMeasure ?? 'reps'
  const p = partsOf(m)
  return { exerciseId, sets: d.sets ?? 3, reps: p.includes('reps') ? (d.reps ?? 10) : 0, kg: p.includes('vikt') ? (d.kg ?? 20) : undefined, seconds: p.includes('tid') ? (d.seconds ?? 30) : undefined }
}
