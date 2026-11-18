import { legacySeedGoals } from '../data/goals'
import { legacySeedWorkouts } from '../data/workouts'
import type { Exercise } from '../data/exercises'

const VERSION_KEY = 'styrkeloggen-schema'
const CURRENT = 3

const read = (k: string): string | null => {
  try { return localStorage.getItem(k) } catch { return null }
}
const write = (k: string, v: string) => {
  try { localStorage.setItem(k, v) } catch { /* ignorera */ }
}
const readJson = <T>(k: string, fallback: T): T => {
  try {
    const raw = read(k)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

/**
 * Äldre versioner hade ett inbyggt övningsbibliotek. Tabellen finns bara kvar för steg 3 i migreringen, som gör om de
 * biblioteksövningar användaren redan använt till vanliga egna övningar (id: [namn, muskelgrupp, mått för kondition]).
 * Den används inte av appen i övrigt, och inga övningar föreslås utifrån den.
 */
const LEGACY_LIBRARY: Record<string, [string, string, string?]> = {
  'bench-press': ['Bänkpress', 'Bröst'],
  'incline-db-press': ['Lutande hantelpress', 'Bröst'],
  'cable-fly': ['Cable flyes', 'Bröst'],
  dips: ['Dips', 'Bröst'],
  'shoulder-press': ['Axelpress', 'Axlar'],
  'lateral-raise': ['Sidolyft', 'Axlar'],
  'face-pull': ['Face pulls', 'Axlar'],
  'tricep-pushdown': ['Tricep pushdown', 'Armar'],
  'bicep-curl': ['Bicepscurl', 'Armar'],
  'hammer-curl': ['Hammercurl', 'Armar'],
  deadlift: ['Marklyft', 'Rygg'],
  'pull-up': ['Chins', 'Rygg'],
  'lat-pulldown': ['Latsdrag', 'Rygg'],
  'barbell-row': ['Skivstångsrodd', 'Rygg'],
  'seated-row': ['Sittande rodd', 'Rygg'],
  squat: ['Knäböj', 'Ben'],
  'leg-press': ['Benpress', 'Ben'],
  'bulgarian-split-squat': ['Bulgarian split squat', 'Ben'],
  'leg-extension': ['Benspark', 'Ben'],
  'romanian-deadlift': ['Rumänsk marklyft', 'Baksida lår'],
  'leg-curl': ['Lårcurl', 'Baksida lår'],
  'hip-thrust': ['Hip thrust', 'Säte'],
  'calf-raise': ['Tåhävningar', 'Ben'],
  plank: ['Plankan', 'Mage'],
  'hanging-leg-raise': ['Hängande benlyft', 'Mage'],
  running: ['Löpning', 'Kondition', 'tid-distans'],
  cycling: ['Cykling', 'Kondition', 'tid-distans'],
  'rowing-machine': ['Roddmaskin', 'Kondition', 'tid-distans'],
  walking: ['Promenad', 'Kondition', 'tid'],
  swimming: ['Simning', 'Kondition', 'distans'],
  'jump-rope': ['Hopprep', 'Kondition', 'tid'],
}

/** Steg 3: biblioteket är borttaget. Övningar ur det som används i pass, mål, historik eller sparats görs om till egna övningar. */
function convertLibraryExercises() {
  const custom = readJson<Exercise[]>('styrkeloggen-custom-exercises', [])
  const have = new Set(custom.map((e) => e.id))
  const used = new Set<string>(readJson<string[]>('styrkeloggen-saved-exercises', []))
  readJson<{ exercises?: { exerciseId: string }[] }[]>('styrkeloggen-workouts', []).forEach((w) => w.exercises?.forEach((e) => used.add(e.exerciseId)))
  readJson<{ exercises?: { exerciseId: string }[] }[]>('styrkeloggen-history', []).forEach((h) => h.exercises?.forEach((e) => used.add(e.exerciseId)))
  Object.keys(readJson<Record<string, unknown>>('styrkeloggen-exercise-overrides', {})).forEach((id) => used.add(id))
  Object.keys(readJson<Record<string, unknown>>('styrkeloggen-exercise-stats', {})).forEach((id) => used.add(id))
  readJson<{ items?: { exerciseId: string }[] }>('styrkeloggen-active-session', {}).items?.forEach((e) => used.add(e.exerciseId))

  // Äldre mål saknar övningens id och är kopplade via namnet
  const goals = readJson<{ exerciseId?: string; exercise: string }[]>('styrkeloggen-goals', [])
  const byName = new Map(Object.entries(LEGACY_LIBRARY).map(([id, [name]]) => [name, id]))
  let goalsChanged = false
  goals.forEach((g) => {
    if (g.exerciseId) return used.add(g.exerciseId)
    const id = byName.get(g.exercise)
    const mine = custom.find((e) => e.name === g.exercise)
    if (mine) { g.exerciseId = mine.id; goalsChanged = true } else if (id) { g.exerciseId = id; used.add(id); goalsChanged = true }
  })

  const added: Exercise[] = []
  used.forEach((id) => {
    const lib = LEGACY_LIBRARY[id]
    if (!lib || have.has(id)) return
    const [name, muscleGroup, measure] = lib
    added.push(
      measure
        ? ({ id, name, muscleGroup, load: 'kroppsvikt', kind: 'kondition', measure } as Exercise)
        : ({ id, name, muscleGroup, load: 'kg' } as Exercise),
    )
  })
  if (added.length) write('styrkeloggen-custom-exercises', JSON.stringify([...custom, ...added]))
  if (goalsChanged) write('styrkeloggen-goals', JSON.stringify(goals))
  try { localStorage.removeItem('styrkeloggen-saved-exercises') } catch { /* ignorera */ }
}

/**
 * Engångsstädning och omvandling av gammal data.
 * Version 2: appen börjar tom, så de gamla förinstallerade exemplen (passen Push/Pull/Ben, rotationen, sparade övningen
 * Hip thrust och exempelmålet Bänkpress) tas bort – men bara om de är orörda, så att inget användaren själv ändrat försvinner.
 * Version 3: det inbyggda övningsbiblioteket är borttaget (se convertLibraryExercises).
 */
export function migrateStorage() {
  const version = Number(read(VERSION_KEY))
  if (version >= CURRENT) return
  if (version < 2) {
    const same = (key: string, seed: unknown) => read(key) === JSON.stringify(seed)
    if (same('styrkeloggen-workouts', legacySeedWorkouts)) write('styrkeloggen-workouts', '[]')
    if (same('styrkeloggen-rotation', { workoutIds: ['push', 'pull', 'legs'], active: true })) write('styrkeloggen-rotation', JSON.stringify({ workoutIds: [], active: false }))
    if (same('styrkeloggen-saved-exercises', ['hip-thrust'])) write('styrkeloggen-saved-exercises', '[]')
    if (same('styrkeloggen-goals', legacySeedGoals)) write('styrkeloggen-goals', '[]')
  }
  convertLibraryExercises()
  write(VERSION_KEY, String(CURRENT))
}
