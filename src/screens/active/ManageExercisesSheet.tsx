import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { SortableList } from '../../components/ui/SortableList'
import styles from './ManageExercisesSheet.module.css'

interface ManageExercisesSheetProps {
  open: boolean
  onClose: () => void
  /** Övningarna i det pågående passet */
  exercises: { name: string }[]
  /** Ny ordning: index i den gamla listan, i nya ordningen */
  onReorder: (order: number[]) => void
  onRemove: (index: number) => void
  /** Byt ut övningen på platsen mot en annan */
  onReplace: (index: number) => void
  onAdd: () => void
}

/** Ändra det pågående passet: flytta, byt, lägg till eller ta bort övningar (sparas inte i det sparade passet). */
export function ManageExercisesSheet({ open, onClose, exercises, onReorder, onRemove, onReplace, onAdd }: ManageExercisesSheetProps) {
  const rows = exercises.map((e, i) => ({ i, name: e.name }))
  return (
    <BottomSheet open={open} onClose={onClose} title="Ändra pass">
      <div className={styles.stack}>
        <p className={styles.note}>Ändringarna gäller bara det här passet. Tryck på ett namn för att byta övning.</p>
        {rows.length > 0 && (
          <SortableList
            items={rows}
            getId={(r) => String(r.i)}
            getLabel={(r) => r.name}
            sortable={rows.length > 1}
            onReorder={(next) => onReorder(next.map((r) => r.i))}
            renderItem={(r) => (
              <div className={styles.row}>
                <button type="button" className={styles.name} onClick={() => onReplace(r.i)} aria-label={`Byt ut ${r.name}`}>
                  <span>{r.name}</span>
                  <Icon name="edit" size={14} />
                </button>
                <button type="button" className={styles.remove} onClick={() => onRemove(r.i)} aria-label={`Ta bort ${r.name} från passet`}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            )}
          />
        )}
        <Button variant="secondary" icon="plus" fullWidth onClick={onAdd}>
          Lägg till övning
        </Button>
      </div>
    </BottomSheet>
  )
}
