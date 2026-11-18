import { IconBadge } from '../../components/ui/IconBadge'
import { isCardio, type Exercise } from '../../data/exercises'
import { StartButton } from './StartButton'
import styles from './ExerciseCard.module.css'

interface ExerciseCardProps {
  exercise: Exercise
  onOpen: () => void
  /** Utelämnas när raden bara används för att välja (t.ex. i "Lägg till övning") */
  onStart?: () => void
}

/** En enskild ÖVNING som rad: ikon, namn, muskelgrupp och (valfritt) en Starta-knapp. */
export function ExerciseCard({ exercise, onOpen, onStart }: ExerciseCardProps) {
  return (
    <div className={styles.row}>
      <button type="button" className={styles.main} onClick={onOpen}>
        <IconBadge icon={isCardio(exercise) ? 'bolt' : 'workout'} size={40} />
        <span className={styles.text}>
          <span className={styles.name}>
            {exercise.name}
          </span>
          <span className={styles.muscle}>{exercise.muscleGroup}</span>
        </span>
      </button>
      {onStart && <StartButton label={`Starta ${exercise.name}`} onClick={onStart} />}
    </div>
  )
}
