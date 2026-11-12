import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Färgad kantlinje, t.ex. för hero-kortet */
  outline?: 'accent-2' | 'accent'
  /** solid = vanlig yta, glass = halvtransparent frostat glas (bakgrunden skymtar igenom) */
  variant?: 'solid' | 'glass'
}

export function Card({ outline, variant = 'solid', className, ...rest }: CardProps) {
  const classes = [styles.card, variant === 'glass' && styles.glass, outline && styles[outline], className]
    .filter(Boolean)
    .join(' ')
  return <section className={classes} {...rest} />
}
