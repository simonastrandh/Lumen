import { Icon } from '../../components/ui/Icon'
import { Tag } from '../../components/ui/Tag'
import { isCardio, type Exercise } from '../../data/exercises'
import styles from './ExerciseCard.module.css'

interface ExerciseCardProps {
  exercise: Exercise
  saved?: boolean
  onOpen: () => void
  /** card = kompakt kort i horisontell lista, row = rad i en lista */
  layout?: 'card' | 'row'
}

/** En enskild ÖVNING: turkos, kompakt, med muskelgrupp. */
export function ExerciseCard({ exercise, onOpen, layout = 'card' }: ExerciseCardProps) {
  return (
    <button type="button" className={`${styles.base} ${styles[layout]}`} onClick={onOpen}>
      <span className={styles.icon}>
        <Icon name={isCardio(exercise) ? 'bolt' : 'workout'} size={18} />
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{exercise.name}</span>
        <span className={styles.tags}>
          <Tag tone="accent">ÖVNING</Tag>
          <span className={styles.muscle}>{exercise.muscleGroup}</span>
        </span>
      </span>
    </button>
  )
}
