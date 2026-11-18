import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { clearSession, readSession } from '../active/session'
import { exerciseCount, targetText, workoutMeta } from './labels'
import { useWorkoutMinutes } from '../../hooks/useWorkoutMinutes'
import styles from './WorkoutOverview.module.css'

/** Översikt över ett pass innan man startar det: övningarna, Redigera och Starta. */
export default function WorkoutOverview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useWorkoutStore()
  const minutesOf = useWorkoutMinutes()
  const workout = id ? store.getWorkout(id) : undefined
  const [confirmNew, setConfirmNew] = useState(false)
  const active = readSession()
  const otherActive = active && workout && active.id !== workout.id ? active : null

  if (!workout) return <p style={{ color: 'var(--text-secondary)' }}>Passet finns inte längre.</p>

  return (
    <>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/pass')} aria-label="Tillbaka till Pass">
          <Icon name="chevronLeft" size={20} />
        </button>
      </header>

      <button
        type="button"
        className={styles.hero}
        onClick={() => (otherActive ? setConfirmNew(true) : navigate(`/pass/aktivt/${workout.id}`))}
        disabled={workout.exercises.length === 0}
        aria-label={`${active && !otherActive ? 'Fortsätt' : 'Starta'} pass ${workout.name}`}
      >
        <span className={styles.heroText}>
          <span className={styles.heroLabel}>{active && !otherActive ? 'Pågående pass' : 'Pass'}</span>
          <span className={styles.heroTitle}>{workout.name}</span>
          <span className={styles.heroMeta}>{workoutMeta(workout, minutesOf(workout))}</span>
        </span>
        <span className={styles.play} aria-hidden="true">
          <Icon name="play" size={22} />
        </span>
      </button>

      {workout.exercises.length > 0 ? (
        <ol className={styles.list}>
          {workout.exercises.map((we, i) => {
            const ex = store.getExercise(we.exerciseId)
            return (
              <li key={`${we.exerciseId}-${i}`} className={styles.item}>
                <span className={styles.itemName}>{ex?.name ?? 'Övning'}</span>
                <span className={styles.target}>{targetText(we, ex)}</span>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className={styles.empty}>{exerciseCount(0)} i passet än. Lägg till minst en för att kunna starta det.</p>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" icon="edit" fullWidth onClick={() => navigate(`/pass/${workout.id}/redigera`)} >
          Redigera övningar
        </Button>
      </div>

      <BottomSheet open={confirmNew} onClose={() => setConfirmNew(false)} title="Du har ett pågående pass">
        <p className={styles.note}>Om du startar {workout.name} avbryts det pågående passet och dess klara set sparas inte.</p>
        <Button variant="primary" fullWidth onClick={() => { clearSession(); navigate(`/pass/aktivt/${workout.id}`) }}>Starta {workout.name}</Button>
        <Button variant="secondary" fullWidth onClick={() => navigate(`/pass/aktivt/${active!.id}`)}>Fortsätt pågående pass</Button>
      </BottomSheet>
    </>
  )
}
