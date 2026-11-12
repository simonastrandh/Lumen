import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BackgroundSpine } from './BackgroundSpine'
import { BottomNav } from './BottomNav'
import { Welcome } from './Welcome'
import styles from './AppShell.module.css'

const KEY = 'styrkeloggen-welcomed'
const ENTER_MS = 1800 // hur länge appens delar tonar fram efteråt

function firstVisit(): boolean {
  try {
    return localStorage.getItem(KEY) === null
  } catch {
    return false
  }
}

/** Mobil-first ram: innehåll + bottennavigering. Delas av alla skärmar. */
export function AppShell() {
  // intro = välkomnande, enter = appen tonar fram, done = vanligt läge
  const [phase, setPhase] = useState<'intro' | 'enter' | 'done'>(() => (firstVisit() ? 'intro' : 'done'))

  useEffect(() => {
    if (phase === 'intro') {
      try {
        localStorage.setItem(KEY, '1')
      } catch {
        /* utan lagring visas välkomnandet bara den här gången */
      }
      return // välkomnandet ligger kvar tills man trycker på skärmen eller knappen
    }
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('done'), ENTER_MS)
      return () => clearTimeout(t)
    }
  }, [phase])

  return (
    <div className={styles.shell}>
      {/* En enda bakgrund för alla sidor – den remountas inte när man byter sida */}
      <BackgroundSpine />
      {/* Bara det här lagret scrollar i telefonramen – bakgrunden ligger utanför och står stilla */}
      <div className={`${styles.scroller} ${phase === 'intro' ? styles.hidden : ''} ${phase === 'enter' ? styles.entering : ''}`} aria-hidden={phase === 'intro' || undefined}>
        <main className={styles.content}>
          <Outlet />
        </main>
        <BottomNav />
      </div>
      {phase !== 'done' && <Welcome leaving={phase === 'enter'} onSkip={() => phase === 'intro' && setPhase('enter')} />}
    </div>
  )
}
