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
/** Antaganden för uppskattningen (sekunder) */
const SECONDS_PER_REP = 5 // en rep inklusive sänkning, paus och lyft
const SET_OVERHEAD = 15 // ta position och komma igång före varje set
const EXERCISE_SETUP = 60 // gå till nästa redskap, ställa in och lasta vikter
const MINUTES_PER_KM = 6

/** Ungefärlig tid i sekunder för en övning utan vila: inlagd tid om den finns, annars reps × ca 5 s per set, plus uppställning. */
export function workSeconds(e: WorkoutExercise, cardio: boolean): number {
  if (cardio) {
    if (e.minutes !== undefined) return e.minutes * 60
    if (e.km !== undefined) return e.km * MINUTES_PER_KM * 60
    return 20 * 60
  }
  const perSet = (e.seconds ?? (e.reps > 0 ? e.reps * SECONDS_PER_REP : 30)) + SET_OVERHEAD
  return EXERCISE_SETUP + e.sets * perSet
}

/**
 * Ungefärlig tid för ett pass i minuter: för varje styrkeövning uppställning, tid per set (inlagd tid, annars
 * reps × ca 5 s) och en kort start före varje set, plus vilan efter varje set utom det allra sista (som i Aktivt pass).
 * Konditionsövningar räknas med sin inlagda tid eller distans. Uppvärmning ingår inte.
 */
export function estimateMinutes(workout: Workout, isCardio: (exerciseId: string) => boolean, restFor: (exerciseId: string) => number): number {
  let seconds = 0
  workout.exercises.forEach((e, i) => {
    const cardio = isCardio(e.exerciseId)
    seconds += workSeconds(e, cardio)
    if (!cardio) seconds += restFor(e.exerciseId) * (i === workout.exercises.length - 1 ? e.sets - 1 : e.sets)
  })
  const min = seconds / 60
  return Math.max(1, min < 20 ? Math.round(min) : Math.round(min / 5) * 5)
}

/** Styrkepass har en skivstång som ikon, konditionspass en blixt */
export function workoutIcon(workout?: Workout): IconName {
  return workout?.kind === 'kondition' ? 'stopwatch' : 'layers'
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
