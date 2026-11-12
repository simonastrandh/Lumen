import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  title: string
  icon?: IconName
  /** Färg på ikonen – lila för pass, turkos för övningar */
  tone?: 'accent' | 'accent-2' | 'neutral'
  action?: ReactNode
  id?: string
}

/** Rubrik för en sektion, t.ex. "MINA PASS", med valfri ikon och knapp till höger. */
export function SectionHeader({ title, icon, tone = 'neutral', action, id }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 id={id} className={styles.title}>
        {icon && <Icon name={icon} size={15} className={styles[tone]} />}
        {title}
      </h2>
      {action}
    </div>
  )
}
