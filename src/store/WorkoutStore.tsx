import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { partsOf, exercises as exercisesLibrary, isBetterSet, resolveExercise, type CardioMeasure, type ExerciseDefaults, type ExerciseStats, type PbMetric, pbMetrics, type Exercise, type MeasureOverride, type StrengthMeasure } from '../data/exercises'
import { entryForExercise, type Workout } from '../data/workouts'
import type { Goal } from '../data/goals'
import { useLocalStorageState } from '../hooks/useLocalStorageState'

export interface Rotation {
  /** Passens id i den ordning de körs, t.ex. [push, pull, legs] */
  workoutIds: string[]
  active: boolean
}

export interface CompletedWorkout {
  /** null = tomt pass som inte var sparat */
  workoutId: string | null
  name: string
  completedAt: string
  /** Detaljer som loggas när ett pass avslutas i Aktivt pass (äldre poster saknar dem) */
  durationSeconds?: number
  setsDone?: number
  /** Total vikt: summan av kg × reps för alla klara set */
  volume?: number
  exercises?: { exerciseId: string; name: string; sets: ExerciseDefaults[] }[]
  pbs?: { exerciseId: string; metrics: PbMetric[] }[]
}

export type CompletedDetails = Pick<CompletedWorkout, 'durationSeconds' | 'setsDone' | 'volume' | 'exercises' | 'pbs'>

interface WorkoutStore {
  workouts: Workout[]
  /** Hittar en övning (bibliotek eller egen) med användarens ändringar */
  getExercise: (id: string) => Exercise | undefined
  savedExerciseIds: string[]
  customExercises: Exercise[]
  /** Användarens övningar: egna + sparade bibliotekövningar */
  myExercises: Exercise[]
  exerciseOverrides: Record<string, MeasureOverride>
  /** Ändrar hur en övning mäts och uppdaterar alla pass som innehåller den */
  setExerciseMeasure: (exerciseId: string, change: { strengthMeasure: StrengthMeasure } | { measure: CardioMeasure }) => void
  /** Standardvärden (set, reps, vikt, tid, distans) som används när övningen läggs i ett pass */
  setExerciseDefaults: (exerciseId: string, patch: ExerciseDefaults) => void
  /** Senaste pass och personbästa per övning */
  exerciseStats: Record<string, ExerciseStats>
  /**
   * Loggar övningens nuvarande värden som senaste pass och jämför med bästa hittills.
   * `before` = värdena när redigeringen började. Returnerar vilka mått som blev nya personbästa.
   */
  commitExerciseValues: (exerciseId: string, before: ExerciseDefaults) => PbMetric[]
  /**
   * Loggar de värden man faktiskt gjorde i ett avslutat pass (bästa genomförda set per övning).
   * Uppdaterar senaste pass och personbästa och returnerar nya PB per övning.
   */
  recordSession: (results: { exerciseId: string; values: ExerciseDefaults; sets: ExerciseDefaults[] }[]) => { exerciseId: string; metrics: PbMetric[] }[]
  addCustomExercise: (exercise: Exercise) => void
  /** Byter namn på en egen övning */
  renameExercise: (exerciseId: string, name: string) => void
  /** Tar bort en övning ur Mina övningar, alla pass och alla mål (egna övningar raderas helt) */
  deleteExercise: (exerciseId: string) => void
  /** Personliga mål (kopplade till övningens id) */
  goals: Goal[]
  saveGoal: (values: Omit<Goal, 'id'>, id?: string) => void
  removeGoal: (id: string) => void
  /** Tar bort ett loggat pass ur historiken och räknar om personbästa för övningarna i det */
  deleteHistoryEntry: (completedAt: string) => void
  rotation: Rotation
  history: CompletedWorkout[]
  getWorkout: (id: string) => Workout | undefined
  saveWorkout: (workout: Workout) => void
  deleteWorkout: (id: string) => void
  toggleSavedExercise: (exerciseId: string) => void
  addExerciseToWorkout: (workoutId: string, exerciseId: string) => void
  setRotation: (rotation: Rotation) => void
  completeWorkout: (workoutId: string | null, name: string, details?: CompletedDetails) => void
}

const Ctx = createContext<WorkoutStore | null>(null)

/** Räknar om senaste pass och personbästa för några övningar utifrån historiken (efter att ett loggat pass tagits bort). */
function recomputeStats(history: CompletedWorkout[], ids: string[], current: Record<string, ExerciseStats>): Record<string, ExerciseStats> {
  const next = { ...current }
  for (const id of ids) {
    const sessions = history.flatMap((h) => {
      const e = h.exercises?.find((x) => x.exerciseId === id)
      return e && e.sets.length ? [{ date: h.completedAt, sets: e.sets, pbs: h.pbs?.find((p) => p.exerciseId === id) }] : []
    })
    if (sessions.length === 0) {
      delete next[id]
      continue
    }
    const best: ExerciseStats['best'] = {}
    let bestSet: ExerciseDefaults | undefined
    for (const sess of sessions) {
      for (const set of sess.sets) {
        for (const m of pbMetrics) if (set[m] !== undefined) best[m] = Math.max(best[m] ?? 0, set[m]!)
        if (isBetterSet(set, bestSet)) bestSet = set
      }
    }
    const lastSess = sessions[sessions.length - 1]
    const last: ExerciseDefaults = {}
    for (const m of pbMetrics) {
      const vals = lastSess.sets.map((x) => x[m]).filter((v): v is number => v !== undefined)
      if (vals.length) last[m] = Math.max(...vals)
    }
    const pbSess = [...sessions].reverse().find((x) => x.pbs)
    next[id] = { best, bestSet, last: { date: lastSess.date, values: last }, lastPb: pbSess?.pbs ? { metrics: pbSess.pbs.metrics, date: pbSess.date } : undefined }
  }
  return next
}

export const newId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

/**
 * Delad, lokalt sparad data om pass: används av både Pass-sidan och Hem.
 * Allt sparas i localStorage tills appen får en riktig backend.
 */
export function WorkoutStoreProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useLocalStorageState<Workout[]>('styrkeloggen-workouts', [])
  const [savedExerciseIds, setSavedExerciseIds] = useLocalStorageState<string[]>('styrkeloggen-saved-exercises', [])
  const [customExercises, setCustomExercises] = useLocalStorageState<Exercise[]>('styrkeloggen-custom-exercises', [])
  const [exerciseOverrides, setExerciseOverrides] = useLocalStorageState<Record<string, MeasureOverride>>('styrkeloggen-exercise-overrides', {})
  const [exerciseStats, setExerciseStats] = useLocalStorageState<Record<string, ExerciseStats>>('styrkeloggen-exercise-stats', {})
  const [rotation, setRotation] = useLocalStorageState<Rotation>('styrkeloggen-rotation', {
    workoutIds: [],
    active: false,
  })
  const [goalsRaw, setGoals] = useLocalStorageState<Goal[]>('styrkeloggen-goals', [])
  const [history, setHistory] = useLocalStorageState<CompletedWorkout[]>('styrkeloggen-history', [])


  // Äldre mål saknar övningens id: koppla dem via namnet så att de följer övningen om den byter namn
  const goals = useMemo(
    () => goalsRaw.map((g) => (g.exerciseId ? g : { ...g, exerciseId: [...customExercises, ...exercisesLibrary].find((e) => e.name === g.exercise)?.id })),
    [goalsRaw, customExercises],
  )

  const value = useMemo<WorkoutStore>(() => {
    const getExercise = (id: string) => resolveExercise(id, customExercises, exerciseOverrides)
    const getWorkout = (id: string) => workouts.find((w) => w.id === id)
    return {
      workouts,
      getExercise,
      savedExerciseIds,
      customExercises,
      myExercises: [...customExercises, ...savedExerciseIds.flatMap((id) => getExercise(id) ?? []).filter((e) => !e.custom)],
      exerciseOverrides,
      exerciseStats,
      recordSession: (results) => {
        const date = new Date().toISOString()
        const next = { ...exerciseStats }
        const out: { exerciseId: string; metrics: PbMetric[] }[] = []
        for (const { exerciseId, values, sets } of results) {
          const prev = next[exerciseId]
          const best: ExerciseStats['best'] = { ...prev?.best }
          const planned = getExercise(exerciseId)?.defaults ?? {}
          const hits: PbMetric[] = []
          for (const m of pbMetrics) {
            const a = values[m]
            if (a === undefined) continue
            const baseline = best[m] ?? planned[m] ?? (m === 'kg' ? 20 : m === 'reps' ? 10 : m === 'seconds' ? 30 : 3)
            if (a > baseline) hits.push(m)
            // Bästa faktiska värde (inte utgångsvärdet) – så att personbästa-listan bara visar det man verkligen gjort
            best[m] = Math.max(best[m] ?? 0, a)
          }
          let bestSet = prev?.bestSet
          for (const st of sets) if (isBetterSet(st, bestSet)) bestSet = st
          next[exerciseId] = { best, bestSet, last: { date, values }, lastPb: hits.length ? { metrics: hits, date } : prev?.lastPb }
          if (hits.length) out.push({ exerciseId, metrics: hits })
        }
        setExerciseStats(next)
        return out
      },
      commitExerciseValues: (exerciseId, before) => {
        const after = getExercise(exerciseId)?.defaults ?? {}
        const prev = exerciseStats[exerciseId]
        const best: ExerciseStats['best'] = { ...prev?.best }
        const hits: PbMetric[] = []
        for (const m of pbMetrics) {
          const a = after[m]
          if (a === undefined) continue
          // Utgångsläge: tidigare bästa, annars värdet innan första redigeringen
          const baseline = best[m] ?? before[m] ?? (m === 'kg' ? 20 : m === 'reps' ? 10 : m === 'seconds' ? 30 : 3)
          if (a > baseline) {
            hits.push(m)
            best[m] = a
          }
        }
        const changed = pbMetrics.some((m) => after[m] !== before[m])
        if (!changed && !prev) return []
        const date = new Date().toISOString()
        const bestSet = hits.length && isBetterSet(after, prev?.bestSet) ? { ...after } : prev?.bestSet
        setExerciseStats((all) => ({
          ...all,
          [exerciseId]: { best, bestSet, last: changed ? { date, values: after } : prev?.last, lastPb: hits.length ? { metrics: hits, date } : prev?.lastPb },
        }))
        return hits
      },
      setExerciseDefaults: (exerciseId, patch) =>
        setExerciseOverrides((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], defaults: { ...prev[exerciseId]?.defaults, ...patch } } })),
      setExerciseMeasure: (exerciseId, change) => {
        setExerciseOverrides((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], ...change } }))
        setCustomExercises((prev) => prev.map((e) => (e.id === exerciseId ? { ...e, ...change } : e)))
        setWorkouts((prev) =>
          prev.map((w) => ({
            ...w,
            exercises: w.exercises.map((we) => {
              if (we.exerciseId !== exerciseId) return we
              if ('strengthMeasure' in change) {
                const m = change.strengthMeasure
                const p = partsOf(m), reps = p.includes('reps'), time = p.includes('tid'), weight = p.includes('vikt')
                return {
                  ...we,
                  reps: reps ? (we.reps > 0 ? we.reps : 10) : 0,
                  seconds: time ? (we.seconds ?? 30) : undefined,
                  kg: weight ? (we.kg ?? 20) : undefined,
                }
              }
              const m = change.measure
              return {
                ...we,
                minutes: m !== 'distans' ? (we.minutes ?? 20) : undefined,
                km: m !== 'tid' ? (we.km ?? 3) : undefined,
              }
            }),
          })),
        )
      },
      goals,
      saveGoal: (values, id) =>
        setGoals((prev) => (id && prev.some((g) => g.id === id) ? prev.map((g) => (g.id === id ? { ...g, ...values } : g)) : [...prev, { ...values, id: newId() }])),
      removeGoal: (id) => setGoals((prev) => prev.filter((g) => g.id !== id)),
      renameExercise: (exerciseId, name) => {
        const n = name.trim()
        if (n) setCustomExercises((prev) => prev.map((e) => (e.id === exerciseId ? { ...e, name: n } : e)))
      },
      deleteExercise: (exerciseId) => {
        setCustomExercises((prev) => prev.filter((e) => e.id !== exerciseId))
        setSavedExerciseIds((prev) => prev.filter((x) => x !== exerciseId))
        setWorkouts((prev) => prev.map((w) => ({ ...w, exercises: w.exercises.filter((e) => e.exerciseId !== exerciseId) })))
        setGoals((prev) => prev.filter((g) => g.exerciseId !== exerciseId && !(g.exerciseId === undefined && g.exercise === getExercise(exerciseId)?.name)))
        setExerciseOverrides((prev) => {
          const { [exerciseId]: _gone, ...rest } = prev
          return rest
        })
        setExerciseStats((prev) => {
          const { [exerciseId]: _gone, ...rest } = prev
          return rest
        })
      },
      deleteHistoryEntry: (completedAt) => {
        const idx = history.findIndex((h) => h.completedAt === completedAt)
        if (idx === -1) return
        const removed = history[idx]
        const nextHistory = history.filter((_, i) => i !== idx)
        setHistory(nextHistory)
        setExerciseStats((prev) => recomputeStats(nextHistory, (removed.exercises ?? []).map((e) => e.exerciseId), prev))
      },
      addCustomExercise: (exercise) => setCustomExercises((prev) => (prev.some((e) => e.id === exercise.id) ? prev : [...prev, exercise])),
      rotation,
      history,
      getWorkout,
      saveWorkout: (workout) =>
        setWorkouts((prev) =>
          prev.some((w) => w.id === workout.id) ? prev.map((w) => (w.id === workout.id ? workout : w)) : [...prev, workout],
        ),
      deleteWorkout: (id) => {
        setWorkouts((prev) => prev.filter((w) => w.id !== id))
        setRotation((prev) => ({ ...prev, workoutIds: prev.workoutIds.filter((x) => x !== id) }))
      },
      toggleSavedExercise: (exerciseId) =>
        setSavedExerciseIds((prev) => (prev.includes(exerciseId) ? prev.filter((x) => x !== exerciseId) : [...prev, exerciseId])),
      addExerciseToWorkout: (workoutId, exerciseId) =>
        setWorkouts((prev) =>
          prev.map((w) =>
            w.id === workoutId ? { ...w, exercises: [...w.exercises, entryForExercise(exerciseId, getExercise(exerciseId))] } : w,
          ),
        ),
      setRotation,
      completeWorkout: (workoutId, name, details) =>
        setHistory((prev) => [...prev, { workoutId, name, completedAt: new Date().toISOString(), ...details }]),
    }
  }, [workouts, savedExerciseIds, goals, setGoals, exerciseStats, setExerciseStats, customExercises, setCustomExercises, exerciseOverrides, setExerciseOverrides, rotation, history, setWorkouts, setSavedExerciseIds, setRotation, setHistory])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWorkoutStore(): WorkoutStore {
  const store = useContext(Ctx)
  if (!store) throw new Error('useWorkoutStore måste användas inuti <WorkoutStoreProvider>')
  return store
}
