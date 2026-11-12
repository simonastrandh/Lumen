import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { IconBadge } from '../../components/ui/IconBadge'
import { Tag } from '../../components/ui/Tag'
import { workoutIcon, type Workout } from '../../data/workouts'
import { workoutMeta } from './labels'
import styles from './WorkoutRow.module.css'

interface WorkoutRowProps {
  workout: Workout
  /** Visas t.ex. när passet är nästa i rotationen */
  badge?: string
}

/** Rad i "Mina pass": ikon, namn, antal övningar/tid. Trycker man på raden öppnas passet (där man startar eller redigerar). */
export function WorkoutRow({ workout, badge }: WorkoutRowProps) {
  const navigate = useNavigate()
  return (
    <li className={styles.row}>
      <button type="button" className={styles.main} onClick={() => navigate(`/pass/${workout.id}`)} aria-label={`Öppna ${workout.name}`}>
        <IconBadge icon={workoutIcon(workout)} tone="accent-2" size={36} flat />
        <span className={styles.text}>
          <span className={styles.name}>
            {workout.name}
            {badge && <Tag tone="accent-2">{badge}</Tag>}
          </span>
          <span className={styles.meta}>{workoutMeta(workout)}</span>
        </span>
        <Icon name="chevronRight" size={16} className={styles.chevron} />
      </button>
    </li>
  )
}
