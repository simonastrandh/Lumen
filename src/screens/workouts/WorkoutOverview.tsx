import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { IconBadge } from '../../components/ui/IconBadge'
import { workoutIcon } from '../../data/workouts'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { clearSession, readSession } from '../active/session'
import { exerciseCount, targetText, workoutMeta } from './labels'
import styles from './WorkoutOverview.module.css'

/** Översikt över ett pass innan man startar det (Figma "02 – Push"): övningarna, Redigera och Starta. */
export default function WorkoutOverview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useWorkoutStore()
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
        <IconBadge icon={workoutIcon(workout)} tone="accent-2" size={48} flat />
        <div>
          <h1 className={styles.title}>{workout.name}</h1>
          <p className={styles.meta}>{workoutMeta(workout)}</p>
        </div>
      </header>

      {workout.exercises.length > 0 ? (
        <ol className={styles.list}>
          {workout.exercises.map((we, i) => {
            const ex = store.getExercise(we.exerciseId)
            return (
              <li key={`${we.exerciseId}-${i}`} className={styles.item}>
                <span className={styles.name}>{ex?.name ?? 'Övning'}</span>
                <span className={styles.target}>{targetText(we, ex)}</span>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className={styles.empty}>{exerciseCount(0)} i passet än. Lägg till minst en för att kunna starta det.</p>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" icon="edit" fullWidth onClick={() => navigate(`/pass/${workout.id}/redigera`)} className={styles.edit}>
          Redigera övningar
        </Button>
        <Button variant="primary" icon="play" fullWidth onClick={() => (otherActive ? setConfirmNew(true) : navigate(`/pass/aktivt/${workout.id}`))} disabled={workout.exercises.length === 0}>
          {active && !otherActive ? 'Fortsätt pass' : 'Starta pass'}
        </Button>
      </div>

      <BottomSheet open={confirmNew} onClose={() => setConfirmNew(false)} title="Du har ett pågående pass">
        <p className={styles.meta}>Om du startar {workout.name} avbryts det pågående passet och dess klara set sparas inte.</p>
        <Button variant="primary" fullWidth onClick={() => { clearSession(); navigate(`/pass/aktivt/${workout.id}`) }}>Starta {workout.name}</Button>
        <Button variant="secondary" fullWidth onClick={() => navigate(`/pass/aktivt/${active!.id}`)}>Fortsätt pågående pass</Button>
      </BottomSheet>
    </>
  )
}
