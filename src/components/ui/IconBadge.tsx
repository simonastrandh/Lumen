import { Icon, type IconName } from './Icon'
import styles from './IconBadge.module.css'

interface IconBadgeProps {
  icon: IconName
  size?: number
}

/** Rund ikonruta med hårfin kant. */
export function IconBadge({ icon, size = 40 }: IconBadgeProps) {
  return (
    <span className={styles.badge} style={{ width: size, height: size }}>
      <Icon name={icon} size={size * 0.52} />
    </span>
  )
}
