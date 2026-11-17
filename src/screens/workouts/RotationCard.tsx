import { useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { getSuggestion, rotationWorkouts } from '../../store/suggestions'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { RotationSheet } from './RotationSheet'
import styles from './RotationCard.module.css'

/** Nuvarande rotation: passen i ordning (Push → Pull → Löptur), markerar vilket pass som är näst. */
export function RotationCard() {
  const store = useWorkoutStore()
  const [open, setOpen] = useState(false)
  const order = rotationWorkouts(store.rotation, store.workouts)
  const suggestion = getSuggestion(store.workouts, store.rotation, store.history)
  const nextId = store.rotation.active && suggestion.kind === 'rotation' ? suggestion.workout.id : null

  return (
    <>
      <section className={styles.card} aria-label="Rotation">
        <div className={styles.head}>
          <h2 className={styles.title}><Icon name="repeat" size={16} /> {order.length ? 'Nuvarande rotation' : 'Rotation'}</h2>
          <span className={styles.status}>{order.length === 0 ? 'Ingen rotation' : store.rotation.active ? 'Aktiv' : 'Pausad'}</span>
        </div>

        {order.length > 0 ? (
          <ol className={styles.chain}>
            {order.map((w, i) => (
              <li key={w.id} className={styles.link}>
                <span className={`${styles.chip} ${w.id === nextId ? styles.next : ''}`}>
                  {w.name}
                  {w.id === nextId && <span className={styles.nextLabel}>Nästa</span>}
                </span>
                {i < order.length - 1 && <Icon name="arrowRight" size={18} className={styles.arrow} />}
              </li>
            ))}
            <li className={styles.link} aria-hidden="true"><Icon name="repeat" size={18} className={styles.arrow} /></li>
          </ol>
        ) : (
          <p className={styles.hint}>Spara en rotation, t.ex. push → pull → ben, så föreslår Hem alltid rätt pass härnäst.</p>
        )}

        <button type="button" className={styles.button} onClick={() => setOpen(true)}>
          <Icon name={order.length ? 'edit' : 'plus'} size={18} />
          {order.length ? 'Ändra rotation' : 'Skapa rotation'}
        </button>
      </section>
      <RotationSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
