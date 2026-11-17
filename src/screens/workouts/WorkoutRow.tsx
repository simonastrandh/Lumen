import { useNavigate } from 'react-router-dom'
import { IconBadge } from '../../components/ui/IconBadge'
import { Tag } from '../../components/ui/Tag'
import { workoutIcon, type Workout } from '../../data/workouts'
import { workoutMeta } from './labels'
import { useWorkoutMinutes } from './useWorkoutMinutes'
import { StartButton } from './StartButton'
import styles from './WorkoutRow.module.css'

interface WorkoutRowProps {
  workout: Workout
  /** Visas t.ex. när passet är nästa i rotationen */
  badge?: string
  onStart: () => void
}

/** Rad i "Mina pass": ikon, namn, antal övningar/tid och en Starta-knapp. Trycker man på raden öppnas passet. */
export function WorkoutRow({ workout, badge, onStart }: WorkoutRowProps) {
  const minutesOf = useWorkoutMinutes()
  const navigate = useNavigate()
  return (
    <li className={styles.row}>
      <button type="button" className={styles.main} onClick={() => navigate(`/pass/${workout.id}`)} aria-label={`Öppna ${workout.name}`}>
        <IconBadge icon={workoutIcon(workout)} size={40} flat />
        <span className={styles.text}>
          <span className={styles.name}>
            {workout.name}
            {badge && <Tag tone="gold">{badge}</Tag>}
          </span>
          <span className={styles.meta}>{workoutMeta(workout, minutesOf(workout))}</span>
        </span>
      </button>
      <StartButton label={`Starta ${workout.name}`} highlight={!!badge} onClick={onStart} />
    </li>
  )
}
