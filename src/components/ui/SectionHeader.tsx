import type { ReactNode } from 'react'
import type { IconName } from './Icon'
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
export function SectionHeader({ title, action, id }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {action}
    </div>
  )
}
