import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { MeasureFields } from '../../components/pickers/MeasureFields'
import type { ExerciseDefaults } from '../../data/exercises'
import styles from './ActiveWorkout.module.css'
import type { SetState } from './helpers'

interface EditSetSheetProps {
  open: boolean
  title: string
  set?: SetState
  canRemove: boolean
  onChange: (patch: ExerciseDefaults) => void
  onRemove: () => void
  onClose: () => void
}

/** Ändra värdena för ett set med hjul. Gäller bara det här passet, inte övningens standardvärden. */
export function EditSetSheet({ open, title, set: s, canRemove, onChange, onRemove, onClose }: EditSetSheetProps) {
  return (
    <BottomSheet open={open && !!s} onClose={onClose} title={title}>
      {s && (
        <>
          <p className={styles.sub}>Gäller bara det här passet – övningens standardvärden ändras inte.</p>
          <MeasureFields
            show={{ reps: (s.reps ?? 0) > 0, kg: s.kg !== undefined, seconds: s.seconds !== undefined, minutes: s.minutes !== undefined, km: s.km !== undefined }}
            values={s}
            onChange={onChange}
          />
          <Button variant="primary" fullWidth onClick={onClose}>Klar</Button>
          {canRemove && (
            <Button variant="ghost" icon="trash" onClick={onRemove} style={{ alignSelf: 'center', color: 'var(--danger)', padding: '10px 16px', fontSize: 12 }}>
              Ta bort set
            </Button>
          )}
        </>
      )}
    </BottomSheet>
  )
}
