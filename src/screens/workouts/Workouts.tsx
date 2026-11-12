import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { SearchField } from '../../components/ui/SearchField'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { type Exercise } from '../../data/exercises'
import { getSuggestion } from '../../store/suggestions'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { AddExerciseSheet } from './AddExerciseSheet'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseSheet } from './ExerciseSheet'
import { RotationCard } from './RotationCard'
import { WorkoutRow } from './WorkoutRow'
import styles from './Workouts.module.css'

const norm = (s: string) => s.toLocaleLowerCase('sv-SE').trim()

/**
 * Pass-sidan. Två tydligt åtskilda saker:
 *  - PASS (lila, lagerikon): en samling övningar man tränar i en följd
 *  - ÖVNINGAR (turkos): en enskild rörelse, t.ex. bänkpress
 */
export default function Workouts() {
  const navigate = useNavigate()
  const store = useWorkoutStore()
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

  const exerciseCard = (e: Exercise, layout: 'card' | 'row') => (
    <ExerciseCard key={e.id} exercise={e} layout={layout} saved={store.savedExerciseIds.includes(e.id)} onOpen={() => setExercise(e)} />
  )

  return (
    <>
      <h1 className={styles.title}>Pass</h1>
      <SearchField value={query} onChange={setQuery} label="Sök pass eller övningar" placeholder="Sök pass eller övningar..." />

      {searching ? (
        <>
          {noResults && <p className={styles.empty}>Inga träffar på ”{query}”.</p>}

          {matchedWorkouts.length > 0 && (
            <section className={styles.section}>
              <SectionHeader title="Pass" icon="layers" tone="accent-2" />
              <ul className={styles.listCard}>{matchedWorkouts.map((w) => <WorkoutRow key={w.id} workout={w} />)}</ul>
            </section>
          )}

          {matchedExercises.length > 0 && (
            <section className={styles.section}>
              <SectionHeader title="Övningar" icon="workout" tone="accent" />
              <div className={styles.stack}>{matchedExercises.map((e) => exerciseCard(e, 'row'))}</div>
            </section>
          )}
        </>
      ) : (
        <>
          <RotationCard />

          <section className={styles.section} aria-labelledby="my-workouts">
            <SectionHeader id="my-workouts" title="Mina sparade pass" icon="layers" tone="accent-2" />
            {store.workouts.length === 0 && (
              <p className={styles.hint}>Inga pass än. Ett pass är en lista övningar du tränar i en följd. Skapa ditt första nedan.</p>
            )}
            {store.workouts.length > 0 && (
              <ul className={styles.listCard}>
                {store.workouts.map((w) => (
                  <WorkoutRow key={w.id} workout={w} badge={w.id === nextRotationId ? 'Nästa' : undefined} />
                ))}
              </ul>
            )}
            <Button variant="secondary" icon="plus" fullWidth onClick={() => navigate('/pass/ny')} className={styles.newWorkout}>
              Skapa nytt pass
            </Button>
          </section>

          <section className={styles.section} aria-labelledby="my-exercises">
            <SectionHeader id="my-exercises" title="Mina övningar" icon="workout" tone="accent" />
            {myExercises.length > 0 ? (
              <div className={styles.stack}>{myExercises.map((e) => exerciseCard(e, 'row'))}</div>
            ) : (
              <p className={styles.hint}>Inga övningar än. Övningar du skriver in när du skapar ett pass dyker upp här.</p>
            )}
            <Button variant="secondary" icon="plus" fullWidth onClick={() => setAdding(true)} className={styles.newExercise}>
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
    </>
  )
}
