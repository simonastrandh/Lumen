import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { getSuggestion, rotationWorkouts } from '../../store/suggestions'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { RotationSheet } from './RotationSheet'
import styles from './RotationCard.module.css'

/** Visar rotationen som en kedja (Push → Pull → Ben) och markerar vilket pass som är näst. */
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
          <h2 className={styles.title}><Icon name="repeat" size={15} /> ROTATION</h2>
          <span className={`${styles.status} ${store.rotation.active && order.length ? styles.on : ''}`}>
            {order.length === 0 ? 'Ingen rotation' : store.rotation.active ? 'Aktiv' : 'Pausad'}
          </span>
        </div>

        {order.length > 0 ? (
          <ol className={styles.chain}>
            {order.map((w, i) => (
              <li key={w.id} className={styles.link}>
                <span className={`${styles.chip} ${w.id === nextId ? styles.next : ''}`}>
                  {w.name}
                  {w.id === nextId && <span className={styles.nextLabel}>NÄSTA</span>}
                </span>
                {i < order.length - 1 && <Icon name="arrowRight" size={14} className={styles.arrow} />}
              </li>
            ))}
            <li className={styles.link} aria-hidden="true"><Icon name="repeat" size={14} className={styles.arrow} /></li>
          </ol>
        ) : (
          <p className={styles.hint}>Spara en rotation, t.ex. push → pull → ben, så föreslår Hem alltid rätt pass härnäst.</p>
        )}

        <Button variant="secondary" icon={order.length ? 'edit' : 'plus'} onClick={() => setOpen(true)} fullWidth>
          {order.length ? 'Ändra rotation' : 'Skapa rotation'}
        </Button>
      </section>
      <RotationSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
