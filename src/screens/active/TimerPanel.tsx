import { useEffect, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { TimeWheel } from '../../components/pickers/MeasureFields'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { durationLabel, formatTime } from '../../components/pickers/TimeField'
import styles from './ActiveWorkout.module.css'
import { isDistanceOnly, isTimed, setText, type SetState, type Timer } from './helpers'

interface TimerPanelProps {
  timer: Timer | null
  now: number
  /** Nästa set som inte är klart i den aktuella övningen */
  nextSet?: SetState
  nextIndex: number
  exerciseName: string
  restSeconds: number
  onRestChange: (seconds: number) => void
  onTimerChange: (t: Timer | null) => void
  onStartSetTimer: (si: number) => void
  onStartRest: (total: number, si: number) => void
  onCompleteSet: (ei: number, si: number) => void
}

/** Ringens storlek följer skärmen: större på höga/breda skärmar, mindre på små (140–220 px). */
function useRingSize() {
  const calc = () => {
    // På datorn visas appen i en telefonram (390 px bred, högst 860 px hög)
    const framed = window.innerWidth >= 700 && window.innerHeight >= 620
    const w = framed ? 390 : window.innerWidth
    const h = framed ? Math.min(860, window.innerHeight - 48) : window.innerHeight
    return Math.round(Math.max(140, Math.min(220, w * 0.46, h * 0.24)))
  }
  const [size, setSize] = useState(calc)
  useEffect(() => {
    const on = () => setSize(calc())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return size
}

/** Ringen och knapparna under den. Visar alltid det som tickar just nu: vila, tid för ett set eller stoppur. */
export function TimerPanel({ timer, now, nextSet, nextIndex, exerciseName, restSeconds, onRestChange, onTimerChange, onStartSetTimer, onStartRest, onCompleteSet }: TimerPanelProps) {
  const ringSize = useRingSize()
  const remaining = timer && timer.kind !== 'stopwatch' ? Math.max(0, (timer.endAt - now) / 1000) : 0
  const elapsed = timer?.kind === 'stopwatch' ? Math.max(0, (now - timer.startAt) / 1000) : 0

  let ringValue = 0
  let ringTone: 'accent' | 'accent-2' = 'accent'
  let ringTime = ''
  let ringLabel = ''
  if (timer && timer.kind !== 'stopwatch') {
    ringValue = (remaining / timer.total) * 100
    ringTone = timer.kind === 'work' ? 'accent-2' : 'accent'
    ringTime = formatTime(Math.ceil(remaining))
    ringLabel = timer.kind === 'work' ? 'tid kvar' : 'vila kvar'
  } else if (timer?.kind === 'stopwatch') {
    ringValue = ((elapsed % 60) / 60) * 100
    ringTone = 'accent-2'
    ringTime = formatTime(Math.floor(elapsed))
    ringLabel = 'pågår'
  } else if (nextSet) {
    ringTime = `Set ${nextIndex + 1}`
    ringLabel = setText(nextSet) || 'redo'
  } else {
    ringTime = 'Klart'
    ringLabel = `${exerciseName} är avklarad`
  }

  return (
    <div className={styles.timer}>
      <div className={styles.ringWrap}>
        <ProgressRing value={ringValue} size={ringSize} strokeWidth={Math.max(7, Math.round(ringSize / 20))} tone={ringTone} label={ringLabel} smooth>
          <div className={styles.ringInner}>
            <span className={`${styles.ringTime} ${ringTone === 'accent-2' ? styles.work : ''}`}>{ringTime}</span>
            <span className={styles.ringLabel}>{timer ? `Set ${timer.si + 1} · ${ringLabel}` : ringLabel}</span>
          </div>
        </ProgressRing>
      </div>

      <div className={styles.timerButtons}>
        {timer?.kind === 'rest' && (
          <>
            <button type="button" className={styles.pill} onClick={() => onTimerChange({ ...timer, total: Math.max(10, timer.total - 30), endAt: timer.endAt - 30000 })}>−30 s</button>
            <button type="button" className={styles.pill} onClick={() => onTimerChange(null)}>Hoppa över</button>
            <button type="button" className={styles.pill} onClick={() => onTimerChange({ ...timer, total: timer.total + 30, endAt: timer.endAt + 30000 })}>+30 s</button>
          </>
        )}
        {(timer?.kind === 'work' || timer?.kind === 'stopwatch') && (
          <>
            <button type="button" className={styles.pill} onClick={() => onTimerChange(null)}>Avbryt</button>
            <button type="button" className={`${styles.pill} ${styles.pillPrimary}`} onClick={() => onCompleteSet(timer.ei, timer.si)}>Klar med set</button>
          </>
        )}
        {!timer && nextSet && (isTimed(nextSet) || isDistanceOnly(nextSet)) && (
          <button type="button" className={`${styles.pill} ${styles.pillPrimary}`} onClick={() => onStartSetTimer(nextIndex)}>
            <Icon name="play" size={12} /> {isTimed(nextSet) ? 'Starta tid' : 'Starta stoppur'}
          </button>
        )}
        {!timer && nextSet && !isTimed(nextSet) && !isDistanceOnly(nextSet) && (
          <>
            {/* Vilotiden går att ändra innan man startar den; den sparas på övningen */}
            <div className={styles.restPick}>
              <TimeWheel title="Vila mellan set" display={`Vila ${durationLabel(restSeconds)}`} seconds={restSeconds} onChange={onRestChange} />
            </div>
            <button type="button" className={`${styles.pill} ${styles.pillPrimary}`} onClick={() => onStartRest(restSeconds, Math.max(0, nextIndex - 1))}>
              <Icon name="play" size={12} /> Starta vila
            </button>
          </>
        )}
      </div>
    </div>
  )
}
