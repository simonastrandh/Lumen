import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import styles from './ManageExercisesSheet.module.css'

interface ManageExercisesSheetProps {
  open: boolean
  onClose: () => void
  /** Övningarna i det pågående passet */
  exercises: { name: string; done: boolean }[]
  onRemove: (index: number) => void
  onAdd: () => void
}

/** Ändra det pågående passet: lägg till eller ta bort övningar (sparas inte i det sparade passet). */
export function ManageExercisesSheet({ open, onClose, exercises, onRemove, onAdd }: ManageExercisesSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Ändra pass">
      <div className={styles.stack}>
        <p className={styles.note}>Ändringarna gäller bara det här passet.</p>
        {exercises.length > 0 && (
          <ul className={styles.list}>
            {exercises.map((e, i) => (
              <li key={i} className={styles.row}>
                <span className={styles.name}>{e.name}</span>
                <button type="button" className={styles.remove} onClick={() => onRemove(i)} aria-label={`Ta bort ${e.name} från passet`}>
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button variant="secondary" icon="plus" fullWidth onClick={onAdd}>
          Lägg till övning
        </Button>
      </div>
    </BottomSheet>
  )
}
