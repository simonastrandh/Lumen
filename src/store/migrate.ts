import { legacySeedGoals } from '../data/goals'
import { legacySeedWorkouts } from '../data/workouts'

const VERSION_KEY = 'styrkeloggen-schema'
const CURRENT = 2

const read = (k: string): string | null => {
  try { return localStorage.getItem(k) } catch { return null }
}
const write = (k: string, v: string) => {
  try { localStorage.setItem(k, v) } catch { /* ignorera */ }
}

/**
 * Engångsstädning av gammal data. Version 2: appen börjar tom, så de gamla förinstallerade exemplen
 * (passen Push/Pull/Ben, rotationen, sparade övningen Hip thrust och exempelmålet Bänkpress) tas bort
 * – men bara om de är orörda, så att inget användaren själv ändrat försvinner.
 */
export function migrateStorage() {
  if (Number(read(VERSION_KEY)) >= CURRENT) return
  const same = (key: string, seed: unknown) => read(key) === JSON.stringify(seed)
  if (same('styrkeloggen-workouts', legacySeedWorkouts)) write('styrkeloggen-workouts', '[]')
  if (same('styrkeloggen-rotation', { workoutIds: ['push', 'pull', 'legs'], active: true })) write('styrkeloggen-rotation', JSON.stringify({ workoutIds: [], active: false }))
  if (same('styrkeloggen-saved-exercises', ['hip-thrust'])) write('styrkeloggen-saved-exercises', '[]')
  if (same('styrkeloggen-goals', legacySeedGoals)) write('styrkeloggen-goals', '[]')
  write(VERSION_KEY, String(CURRENT))
}
