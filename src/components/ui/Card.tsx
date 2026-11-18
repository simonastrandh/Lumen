import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'

/** Platt kort med hårfin kant. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={[styles.card, className].filter(Boolean).join(' ')} {...rest} />
}
