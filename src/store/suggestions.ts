import type { Workout } from '../data/workouts'
import type { CompletedWorkout, Rotation } from './WorkoutStore'

export type Suggestion =
  | { kind: 'rotation'; workout: Workout; order: Workout[]; index: number }
  | { kind: 'random'; workout: Workout }
  | { kind: 'none' }

/** Rotationens pass i ordning (pass som tagits bort hoppas över). */
export function rotationWorkouts(rotation: Rotation, workouts: Workout[]): Workout[] {
  return rotation.workoutIds.flatMap((id) => workouts.find((w) => w.id === id) ?? [])
}

/**
 * Nästa pass i rotationen: passet efter det senast AVSLUTADE passet som ingår i rotationen.
 * Har inget rotationspass körts än börjar den från början.
 */
export function nextInRotation(order: Workout[], history: CompletedWorkout[]): number {
  for (let i = history.length - 1; i >= 0; i--) {
    const idx = order.findIndex((w) => w.id === history[i].workoutId)
    if (idx !== -1) return (idx + 1) % order.length
  }
  return 0
}

/** Enkel deterministisk slump: samma förslag hela dagen, nytt nästa dag. */
function seededIndex(seed: string, length: number): number {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return Math.abs(h) % length
}

/**
 * Förslag på hemskärmen:
 *  - aktiv rotation → nästa pass i rotationen
 *  - annars → slumpat bland sparade pass (samma hela dagen, helst inte samma som senast)
 */
export function getSuggestion(
  workouts: Workout[],
  rotation: Rotation,
  history: CompletedWorkout[],
  today: Date = new Date(),
): Suggestion {
  const order = rotationWorkouts(rotation, workouts)
  if (rotation.active && order.length > 0) {
    const index = nextInRotation(order, history)
    return { kind: 'rotation', workout: order[index], order, index }
  }
  if (workouts.length === 0) return { kind: 'none' }

  const lastId = history.at(-1)?.workoutId
  const pool = workouts.length > 1 ? workouts.filter((w) => w.id !== lastId) : workouts
  const seed = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${history.length}`
  return { kind: 'random', workout: pool[seededIndex(seed, pool.length)] }
}
