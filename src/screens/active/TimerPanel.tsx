import { useEffect, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { TimeWheel } from '../../components/pickers/MeasureFields'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { durationLabel, formatTime } from '../../components/pickers/TimeField'
import { distanceUnit, fmtValue, weightUnit } from '../../data/units'
import styles from './ActiveWorkout.module.css'
import { isDistanceOnly, isTimed, timerRemaining, type SetState, type Timer } from './helpers'

interface TimerPanelProps {
  timer: Timer | null
  now: number
  /** Nästa set som inte är klart i den aktuella övningen */
  nextSet?: SetState
  nextIndex: number
  totalSets: number
  exerciseName: string
  restSeconds: number
  onRestChange: (seconds: number) => void
  onTimerChange: (t: Timer | null) => void
  onStartSetTimer: (si: number) => void
  onStartRest: (total: number, si: number) => void
  onCompleteSet: (ei: number, si: number) => void
}

/** Ringens storlek följer skärmen: större på höga/breda skärmar, mindre på små (150–240 px). */
function useRingSize() {
  const calc = () => {
    // På datorn visas appen i en telefonram (390 px bred, högst 860 px hög)
    const framed = window.innerWidth >= 700 && window.innerHeight >= 620
    const w = framed ? 390 : window.innerWidth
    const h = framed ? Math.min(860, window.innerHeight - 48) : window.innerHeight
    return Math.round(Math.max(150, Math.min(240, w * 0.62, h * 0.29)))
  }
  const [size, setSize] = useState(calc)
  useEffect(() => {
    const on = () => setSize(calc())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return size
}

/** Det stora värdet för nästa set: vikt om det finns, annars tid, distans eller reps. */
function focusParts(s: SetState): { value: string; unit: string; second?: string } {
  const reps = s.reps !== undefined && s.reps > 0 ? `${s.reps} reps` : undefined
  const time = s.seconds !== undefined ? durationLabel(s.seconds) : s.minutes !== undefined ? durationLabel(s.minutes * 60) : undefined
  if (s.kg !== undefined) return { value: fmtValue('kg', s.kg), unit: weightUnit(), second: reps ?? time }
  if (s.minutes !== undefined) return { value: String(Math.round(s.minutes * 100) / 100).replace('.', ','), unit: 'min', second: s.km !== undefined ? `${fmtValue('km', s.km)} ${distanceUnit()}` : undefined }
  if (s.seconds !== undefined) return { value: s.seconds >= 60 ? formatTime(s.seconds) : String(s.seconds), unit: s.seconds >= 60 ? '' : 's', second: reps }
  if (s.km !== undefined) return { value: fmtValue('km', s.km), unit: distanceUnit() }
  return { value: String(s.reps ?? 0), unit: 'reps' }
}

/**
 * Den stora ytan i Aktivt pass. Två lägen som glider över i varandra:
 *  - ingen timer: nästa set som stor siffra, med en liten vilorad (eller Starta tid för set med tid)
 *  - timer igång: ringen med tiden tar över och det stora setet fälls ihop
 */
export function TimerPanel({ timer, now, nextSet, nextIndex, totalSets, exerciseName, restSeconds, onRestChange, onTimerChange, onStartSetTimer, onStartRest, onCompleteSet }: TimerPanelProps) {
  const ringSize = useRingSize()
  const remaining = timerRemaining(timer, now)
  const elapsed = timer?.kind === 'stopwatch' ? Math.max(0, (now - timer.startAt) / 1000) : 0
  const paused = timer?.kind === 'rest' && timer.pausedLeft !== undefined

  let ringValue = 0
  let ringTime = ''
  let ringLabel = ''
  if (timer && timer.kind !== 'stopwatch') {
    ringValue = (remaining / timer.total) * 100
    ringTime = formatTime(Math.ceil(remaining))
    ringLabel = timer.kind === 'work' ? 'tid kvar' : paused ? 'pausad' : 'vila kvar'
  } else if (timer?.kind === 'stopwatch') {
    ringValue = ((elapsed % 60) / 60) * 100
    ringTime = formatTime(Math.floor(elapsed))
    ringLabel = 'pågår'
  }

  const adjust = (delta: number) => {
    if (timer?.kind !== 'rest') return
    const total = Math.max(10, timer.total + delta)
    if (timer.pausedLeft !== undefined) onTimerChange({ ...timer, total, pausedLeft: Math.max(1, timer.pausedLeft + delta) })
    else onTimerChange({ ...timer, total, endAt: timer.endAt + delta * 1000 })
  }
  const togglePause = () => {
    if (timer?.kind !== 'rest') return
    if (timer.pausedLeft !== undefined) {
      const { pausedLeft, ...rest } = timer
      onTimerChange({ ...rest, endAt: Date.now() + pausedLeft * 1000 })
    } else onTimerChange({ ...timer, pausedLeft: remaining })
  }

  const showRing = timer !== null
  const focus = nextSet ? focusParts(nextSet) : null

  return (
    <div className={styles.stage}>
      {/* 1. Nästa set som stor siffra */}
      <div className={`${styles.collapse} ${!showRing ? styles.open : ''}`} inert={showRing}>
        <div className={styles.collapseInner}>
          {focus && nextSet ? (
            <div className={styles.focus}>
              <p className={styles.focusLabel}>Set {nextIndex + 1} av {totalSets}</p>
              <div className={styles.focusValue}>
                <span className={styles.focusNumber}>{focus.value}</span>
                {focus.unit && <span className={styles.focusUnit}>{focus.unit}</span>}
              </div>
              {focus.second && <p className={styles.focusSecond}>{focus.second}</p>}

              {(isTimed(nextSet) || isDistanceOnly(nextSet)) ? (
                <button type="button" className={styles.startBig} onClick={() => onStartSetTimer(nextIndex)}>
                  <Icon name="play" size={16} /> {isTimed(nextSet) ? 'Starta tid' : 'Starta stoppur'}
                </button>
              ) : (
                <div className={styles.restRow}>
                  {/* Vilotiden går att ändra innan man startar den; den sparas på övningen */}
                  <TimeWheel
                    title="Vila mellan set"
                    seconds={restSeconds}
                    onChange={onRestChange}
                    trigger={(open, label) => (
                      <button type="button" className={styles.restTime} onClick={open} aria-label={label} aria-haspopup="dialog">
                        <span className={styles.restLabel}>Vila</span>
                        <span className={styles.restValue}>{formatTime(restSeconds)}</span>
                        <Icon name="edit" size={16} />
                      </button>
                    )}
                  />
                  <button type="button" className={styles.restPlay} onClick={() => onStartRest(restSeconds, Math.max(0, nextIndex - 1))} aria-label="Starta vila">
                    <Icon name="play" size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.focus}>
              <p className={styles.focusLabel}>{exerciseName}</p>
              <div className={styles.focusValue}>
                <span className={styles.focusNumber}>Klart</span>
              </div>
              <p className={styles.focusSecond}>Alla set är avklarade</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Ringen tar över när en timer går */}
      <div className={`${styles.collapse} ${showRing ? styles.open : ''}`} inert={!showRing}>
        <div className={styles.collapseInner}>
          <div className={styles.timer}>
            <ProgressRing value={ringValue} size={ringSize} strokeWidth={9} label={ringLabel || 'Timer'} smooth>
              <div className={styles.ringInner}>
                <span className={styles.ringTime}>{ringTime}</span>
                <span className={styles.ringLabel}>{ringLabel}</span>
              </div>
            </ProgressRing>

            {timer?.kind === 'rest' && (
              <>
                <div className={styles.timerButtons}>
                  <button type="button" className={styles.pill} onClick={() => adjust(-30)}>−30 s</button>
                  <button type="button" className={styles.pill} onClick={togglePause}>
                    <Icon name={paused ? 'play' : 'pause'} size={14} /> {paused ? 'Fortsätt' : 'Pausa'}
                  </button>
                  <button type="button" className={styles.pill} onClick={() => adjust(30)}>+30 s</button>
                </div>
                <button type="button" className={styles.skip} onClick={() => onTimerChange(null)}>Hoppa över vilan</button>
              </>
            )}
            {(timer?.kind === 'work' || timer?.kind === 'stopwatch') && (
              <div className={styles.timerButtons}>
                <button type="button" className={styles.pill} onClick={() => onTimerChange(null)}>Avbryt</button>
                <button type="button" className={`${styles.pill} ${styles.pillPrimary}`} onClick={() => onCompleteSet(timer.ei, timer.si)}>Klar med set</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
