import { Icon, type IconName } from './Icon'
import styles from './IconBadge.module.css'

interface IconBadgeProps {
  icon: IconName
  size?: number
  /** accent (turkos) = övning/standard, accent-2 (lila) = pass */
  tone?: 'accent' | 'accent-2'
  /** Platt variant utan glöd (som övningsikonerna): tonad bakgrund och tunn ring */
  flat?: boolean
}

/** Rund badge med glödande linjeikon. */
export function IconBadge({ icon, size = 40, tone = 'accent', flat }: IconBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${flat ? styles.flat : ''}`} style={{ width: size, height: size }}>
      <Icon name={icon} size={size * 0.52} />
    </span>
  )
}
