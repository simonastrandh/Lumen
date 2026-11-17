import { useEffect, useRef } from 'react'
import { Icon } from '../ui/Icon'
import styles from './Welcome.module.css'

interface WelcomeProps {
  /** true medan välkomnandet tonar ut och appen kommer fram */
  leaving: boolean
  onSkip: () => void
}

/** Välkomnande första gången appen öppnas: LUMEN i stort, sedan tonar appen fram. */
export function Welcome({ leaving, onSkip }: WelcomeProps) {
  const btn = useRef<HTMLButtonElement>(null)
  // Tangentbordsanvändare kan trycka Enter direkt
  useEffect(() => btn.current?.focus({ preventScroll: true }), [])
  return (
    <div className={`${styles.welcome} ${leaving ? styles.leaving : ''}`} onClick={onSkip} role="presentation">
      <p className={styles.top}>Träningslogg</p>
      <div className={styles.middle}>
        <h1 className={styles.title}>Lumen</h1>
        <p className={styles.tagline}>Din träning. Ditt tempo.</p>
      </div>
      <button ref={btn} type="button" className={styles.go}>
        Tryck för att fortsätta
        <Icon name="arrowRight" size={18} />
      </button>
    </div>
  )
}
