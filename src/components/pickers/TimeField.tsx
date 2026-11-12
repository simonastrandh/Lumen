import { useId, useState } from 'react'
import styles from './TimeField.module.css'

interface TimeFieldProps {
  /** Total tid i sekunder */
  value: number
  onChange: (totalSeconds: number) => void
  label: string
  /** Visa label ovanför fältet (annars bara för skärmläsare) */
  showLabel?: boolean
  error?: boolean
  /** Tillåt 0:00 (t.ex. nuvarande tid i ett mål) */
  allowZero?: boolean
  /** Valfritt fält: visas tomt när värdet är 0 och tomt = 0 (inget mål) */
  optional?: boolean
}

const digits = (s: string) => s.replace(/\D/g, '').slice(0, 3)
const pad = (n: number) => String(n).padStart(2, '0')

/** Tid som två textfält: minuter : sekunder. Skrivs in manuellt. */
export function TimeField({ value, onChange, label, showLabel, error, allowZero, optional }: TimeFieldProps) {
  const id = useId()
  const [min, setMin] = useState(optional && value === 0 ? '' : String(Math.floor(value / 60)))
  const [sec, setSec] = useState(optional && value === 0 ? '' : pad(value % 60))

  const total = (m: string, s: string) => (Number(m) || 0) * 60 + (Number(s) || 0)
  const emit = (m: string, s: string) => {
    const t = total(m, s)
    if (t > 0 || allowZero || optional) onChange(t)
  }
  // Vid blur normaliseras t.ex. 0:75 till 1:15
  const normalize = () => {
    if (optional && min === '' && sec === '') return
    const t = total(min, sec)
    setMin(String(Math.floor(t / 60)))
    setSec(pad(t % 60))
  }

  return (
    <div className={styles.wrap}>
      <span className={showLabel ? styles.label : 'sr-only'} id={`${id}-l`}>{label}</span>
      <div className={`${styles.field} ${error ? styles.invalid : ''}`} role="group" aria-labelledby={`${id}-l`}>
        <input
          className={styles.input}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          aria-label={`${label}, minuter`}
          value={min}
          onChange={(e) => { const v = digits(e.target.value); setMin(v); emit(v, sec) }}
          onBlur={normalize}
        />
        <span className={styles.colon} aria-hidden="true">:</span>
        <input
          className={styles.input}
          inputMode="numeric"
          autoComplete="off"
          placeholder="00"
          aria-label={`${label}, sekunder`}
          value={sec}
          onChange={(e) => { const v = digits(e.target.value); setSec(v); emit(min, v) }}
          onBlur={normalize}
        />
      </div>
    </div>
  )
}

/** 75 → "1:15" */
export const formatTime = (totalSeconds: number) => {
  const t = Math.round(totalSeconds)
  return t >= 3600 ? `${Math.floor(t / 3600)}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}` : `${Math.floor(t / 60)}:${pad(t % 60)}`
}

/** 45 → "45 s", 600 → "10 min", 75 → "1:15 min" */
export const durationLabel = (totalSeconds: number) => {
  const t = Math.round(totalSeconds)
  if (t < 60) return `${t} s`
  if (t >= 3600) {
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60
    return sec ? `${h}:${pad(m)}:${pad(sec)} h` : m ? `${h} h ${m} min` : `${h} h`
  }
  return t % 60 === 0 ? `${t / 60} min` : `${formatTime(t)} min`
}
