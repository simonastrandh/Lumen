import { Icon } from '../../components/ui/Icon'
import styles from './ActiveWorkout.module.css'
import { isDistanceOnly, isTimed, setText, type SetState, type Timer } from './helpers'

interface SetListProps {
  sets: SetState[]
  ei: number
  cardio: boolean
  timer: Timer | null
  onEdit: (si: number) => void
  onToggle: (si: number, done: boolean) => void
  onStartTimer: (si: number) => void
  onAddSet: () => void
}

/** Setlistan: bara den scrollar om den blir för lång. */
export function SetList({ sets, ei, cardio, timer, onEdit, onToggle, onStartTimer, onAddSet }: SetListProps) {
  return (
    <section className={`${styles.card} ${styles.setsCard}`} aria-label="Set">
      {sets.map((s, si) => (
        <div key={si} className={`${styles.setRow} ${s.done ? styles.setRowDone : ''}`}>
          <span className={styles.setName}>{cardio ? 'Pass' : `Set ${si + 1}`}</span>
          <button type="button" className={styles.setValues} onClick={() => onEdit(si)} aria-label={`Ändra ${cardio ? 'värden' : `set ${si + 1}`}: ${setText(s)}`}>
            {setText(s) || 'Ange värden'}
          </button>
          {(isTimed(s) || isDistanceOnly(s)) && !s.done && !(timer && timer.ei === ei && timer.si === si && timer.kind !== 'rest') && (
            <button type="button" className={styles.play} onClick={() => onStartTimer(si)} aria-label={`Starta timer för set ${si + 1}`}>
              <Icon name="play" size={12} />
            </button>
          )}
          <button type="button" className={`${styles.check} ${s.done ? styles.checkDone : ''}`} aria-pressed={s.done} aria-label={`Set ${si + 1} klart`} onClick={() => onToggle(si, !s.done)}>
            {s.done && <Icon name="check" size={16} />}
          </button>
        </div>
      ))}
      {!cardio && (
        <button type="button" className={styles.addSet} onClick={onAddSet}>
          + Lägg till set
        </button>
      )}
    </section>
  )
}
