import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { SearchField } from '../../components/ui/SearchField'
import { type Exercise } from '../../data/exercises'
import { getSuggestion } from '../../store/suggestions'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { AddExerciseSheet } from './AddExerciseSheet'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseSheet } from './ExerciseSheet'
import { RotationCard } from './RotationCard'
import { useStartGuard } from './useStartGuard'
import { WorkoutRow } from './WorkoutRow'
import styles from './Workouts.module.css'

const norm = (s: string) => s.toLocaleLowerCase('sv-SE').trim()

/**
 * Pass-sidan: nuvarande rotation överst, sedan dina pass (PASS) och dina övningar (ÖVNINGAR).
 * Varje pass och varje övning har en Starta-knapp.
 */
export default function Workouts() {
  const navigate = useNavigate()
  const store = useWorkoutStore()
  const { startWorkout, startExercise, sheet: startSheet } = useStartGuard()
  const [query, setQuery] = useState('')
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [adding, setAdding] = useState(false)

  const q = norm(query)
  const searching = q.length > 0

  const nextRotationId = (() => {
    const s = getSuggestion(store.workouts, store.rotation, store.history)
    return store.rotation.active && s.kind === 'rotation' ? s.workout.id : null
  })()

  // Bara användarens egna övningar: sparade samt de som skrivits in själv
  const myExercises = store.myExercises

  const matchedWorkouts = store.workouts.filter((w) => norm(w.name).includes(q))
  const matchedExercises = myExercises.filter((e) => norm(e.name).includes(q) || norm(e.muscleGroup).includes(q))
  const noResults = searching && !matchedWorkouts.length && !matchedExercises.length

  const workoutRows = (list: typeof store.workouts) => (
    <ul className={styles.list}>
      {list.map((w) => (
        <WorkoutRow key={w.id} workout={w} badge={w.id === nextRotationId ? 'Nästa' : undefined} onStart={() => startWorkout(w.id, w.name)} />
      ))}
    </ul>
  )
  const exerciseRows = (list: Exercise[]) => (
    <div className={styles.list}>
      {list.map((e) => (
        <ExerciseCard key={e.id} exercise={e} onOpen={() => setExercise(e)} onStart={() => startExercise(e)} />
      ))}
    </div>
  )

  return (
    <>
      <h1 className={styles.top}>Pass</h1>

      {!searching && <RotationCard />}

      <div className={styles.search}>
        <SearchField value={query} onChange={setQuery} label="Sök pass eller övningar" placeholder="Sök pass eller övningar..." />
      </div>

      {searching ? (
        <>
          {noResults && <p className={styles.empty}>Inga träffar på ”{query}”.</p>}
          {matchedWorkouts.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.heading}>Pass</h2>
              {workoutRows(matchedWorkouts)}
            </section>
          )}
          {matchedExercises.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.heading}>Övningar</h2>
              {exerciseRows(matchedExercises)}
            </section>
          )}
        </>
      ) : (
        <>
          <section className={styles.section} aria-labelledby="my-workouts">
            <h2 id="my-workouts" className={styles.heading}>Mina pass</h2>
            {store.workouts.length === 0 && (
              <p className={styles.empty}>Inga pass än. Ett pass är en lista övningar du tränar i en följd. Skapa ditt första nedan.</p>
            )}
            {store.workouts.length > 0 && workoutRows(store.workouts)}
            <Button variant="primary" icon="plus" fullWidth onClick={() => navigate('/pass/ny')}>
              Skapa nytt pass
            </Button>
          </section>

          <section className={`${styles.section} ${styles.last}`} aria-labelledby="my-exercises">
            <h2 id="my-exercises" className={styles.heading}>Mina övningar</h2>
            {myExercises.length > 0 ? exerciseRows(myExercises) : <p className={styles.empty}>Inga övningar än. Övningar du skriver in när du skapar ett pass dyker upp här.</p>}
            <Button variant="secondary" icon="plus" fullWidth onClick={() => setAdding(true)}>
              Lägg till ny övning
            </Button>
          </section>
        </>
      )}

      <AddExerciseSheet
        open={adding}
        onClose={() => setAdding(false)}
        pickedIds={[]}
        submitLabel="Spara övning"
        onPick={() => {
          // Övningen sparas bland Mina övningar av AddExerciseSheet själv
          setAdding(false)
        }}
      />
      <ExerciseSheet exercise={exercise} onClose={() => setExercise(null)} />
      {startSheet}
    </>
  )
}
