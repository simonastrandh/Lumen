import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './Tag.module.css'

interface TagProps {
  children: ReactNode
  /** accent-2 (lila) = pass, accent (turkos) = övning, gold = nivå/rekord */
  tone?: 'accent' | 'accent-2' | 'gold' | 'neutral'
  icon?: IconName
}

/** Liten pill-etikett. */
export function Tag({ children, tone = 'neutral', icon }: TagProps) {
  return (
    <span className={`${styles.tag} ${styles[tone]}`}>
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  )
}
