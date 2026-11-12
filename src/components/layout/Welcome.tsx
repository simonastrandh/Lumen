import { useEffect, useRef } from 'react'
import styles from './Welcome.module.css'

interface WelcomeProps {
  /** true medan välkomnandet tonar ut och appen kommer fram */
  leaving: boolean
  onSkip: () => void
}

/** Välkomnande första gången appen öppnas: bakgrunden i centrum, sedan tonar appen fram. */
export function Welcome({ leaving, onSkip }: WelcomeProps) {
  const btn = useRef<HTMLButtonElement>(null)
  // Tangentbordsanvändare kan trycka Enter direkt
  useEffect(() => btn.current?.focus({ preventScroll: true }), [])
  return (
    <div className={`${styles.welcome} ${leaving ? styles.leaving : ''}`} onClick={onSkip} role="presentation">
      <div className={styles.panel}>
      <div className={styles.text}>
        <h1 className={styles.title}>Lumen</h1>
        <span className={styles.line} aria-hidden="true" />
        <p className={styles.tagline}>Din träning. Ditt tempo.</p>
      </div>
      <button ref={btn} type="button" className={styles.hint}>Tryck för att fortsätta</button>
      </div>
    </div>
  )
}
