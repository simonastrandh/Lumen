import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './Tag.module.css'

interface TagProps {
  children: ReactNode
  /** neutral = kantlinje och dämpad text, highlight = accentfylld (rekord, "Nästa") */
  tone?: 'neutral' | 'highlight'
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
