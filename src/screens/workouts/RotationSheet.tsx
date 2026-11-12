import { BottomSheet } from '../../components/ui/BottomSheet'
import { Icon } from '../../components/ui/Icon'
import { SortableList } from '../../components/ui/SortableList'
import { Toggle } from '../../components/ui/Toggle'
import { Tag } from '../../components/ui/Tag'
import type { Workout } from '../../data/workouts'
import { rotationWorkouts } from '../../store/suggestions'
import { useWorkoutStore } from '../../store/WorkoutStore'
import styles from './RotationSheet.module.css'

interface RotationSheetProps {
  open: boolean
  onClose: () => void
}

/** Ställ in rotationen: vilka pass, i vilken ordning, och om den är aktiv. */
export function RotationSheet({ open, onClose }: RotationSheetProps) {
  const { workouts, rotation, setRotation } = useWorkoutStore()
  const order = rotationWorkouts(rotation, workouts)
  const available = workouts.filter((w) => !rotation.workoutIds.includes(w.id))
  const setIds = (ids: string[]) => setRotation({ ...rotation, workoutIds: ids })

  return (
    <BottomSheet open={open} onClose={onClose} title="Din rotation" eyebrow={<Tag tone="accent-2" icon="repeat">ROTATION</Tag>}>
      <p className={styles.help}>
        Passen körs i den här ordningen. När du avslutar ett pass föreslår appen nästa i listan på Hem.
      </p>

      <label className={styles.toggleRow}>
        <span>
          <span className={styles.toggleTitle}>Rotation aktiv</span>
          <span className={styles.toggleHint}>{rotation.active ? 'Hem föreslår nästa pass i rotationen' : 'Hem föreslår slumpade pass av dina sparade'}</span>
        </span>
        <Toggle checked={rotation.active} onChange={(active) => setRotation({ ...rotation, active })} label="Rotation aktiv" />
      </label>

      {order.length === 0 ? (
        <p className={styles.empty}>Inga pass i rotationen än. Lägg till några nedan.</p>
      ) : (
        <SortableList<Workout>
          items={order}
          getId={(w) => w.id}
          getLabel={(w) => w.name}
          sortable
          onReorder={(next) => setIds(next.map((w) => w.id))}
          renderItem={(w) => (
            <div className={styles.item}>
              <span className={styles.step}>{order.findIndex((x) => x.id === w.id) + 1}</span>
              <span className={styles.itemName}>{w.name}</span>
              <button type="button" className={styles.remove} onClick={() => setIds(rotation.workoutIds.filter((id) => id !== w.id))} aria-label={`Ta bort ${w.name} från rotationen`}>
                <Icon name="minus" size={14} />
              </button>
            </div>
          )}
        />
      )}

      {available.length > 0 && (
        <div className={styles.add}>
          <p className={styles.addLabel}>Lägg till i rotationen</p>
          <div className={styles.chips}>
            {available.map((w) => (
              <button key={w.id} type="button" className={styles.chip} onClick={() => setIds([...rotation.workoutIds, w.id])}>
                <Icon name="plus" size={13} /> {w.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
