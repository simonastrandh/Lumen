import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import styles from './WheelPicker.module.css'

const ITEM = 44 // höjd per rad (px)
const VISIBLE = 5 // antal synliga rader
const PAD = ((VISIBLE - 1) / 2) * ITEM

export interface WheelColumnSpec {
  values: number[]
  value: number
  onChange: (value: number) => void
  /** Enhet som visas ovanför hjulet, t.ex. "min" */
  unit: string
  format?: (v: number) => string
}

/** Ett scrollbart hjul (som i iPhones timer): scrolla eller dra, det som hamnar i mitten är valt. */
function WheelColumn({ values, value, onChange, unit, format = String }: WheelColumnSpec) {
  const ref = useRef<HTMLDivElement>(null)
  const index = Math.max(0, values.indexOf(value))
  const [live, setLive] = useState(index)
  const timer = useRef<number>(0)
  const drag = useRef<{ y: number; top: number; moved: boolean } | null>(null)

  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = index * ITEM
    // bara vid första visningen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const settle = () => {
    const el = ref.current
    if (!el) return
    const i = Math.min(values.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM)))
    setLive(i)
    if (values[i] !== value) onChange(values[i])
  }

  const goTo = (i: number) => ref.current?.scrollTo({ top: i * ITEM, behavior: 'smooth' })

  return (
    <div className={styles.column}>
      <span className={styles.unit}>{unit}</span>
      <div className={styles.wheelWrap}>
        <div className={styles.band} aria-hidden="true" />
        <div
          ref={ref}
          className={styles.wheel}
          role="spinbutton"
          aria-label={unit}
          aria-valuemin={values[0]}
          aria-valuemax={values[values.length - 1]}
          aria-valuenow={values[live]}
          aria-valuetext={`${format(values[live])} ${unit}`}
          tabIndex={0}
          onScroll={(e) => {
            const i = Math.min(values.length - 1, Math.max(0, Math.round(e.currentTarget.scrollTop / ITEM)))
            setLive(i)
            window.clearTimeout(timer.current)
            timer.current = window.setTimeout(settle, 90)
          }}
          onKeyDown={(e) => {
            const jump: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 5, PageUp: -5 }
            if (e.key in jump) { e.preventDefault(); goTo(Math.min(values.length - 1, Math.max(0, live + jump[e.key]))) }
            if (e.key === 'Home') { e.preventDefault(); goTo(0) }
            if (e.key === 'End') { e.preventDefault(); goTo(values.length - 1) }
          }}
          // Dra med mus (pekskärmar scrollar redan av sig själva)
          onPointerDown={(e) => {
            if (e.pointerType !== 'mouse') return
            drag.current = { y: e.clientY, top: e.currentTarget.scrollTop, moved: false }
            e.currentTarget.setPointerCapture(e.pointerId)
            e.currentTarget.style.scrollSnapType = 'none'
          }}
          onPointerMove={(e) => {
            const d = drag.current
            if (!d) return
            if (Math.abs(e.clientY - d.y) > 3) d.moved = true
            e.currentTarget.scrollTop = d.top - (e.clientY - d.y)
          }}
          onPointerUp={(e) => {
            const d = drag.current
            if (!d) return
            drag.current = null
            e.currentTarget.style.scrollSnapType = ''
            if (d.moved) goTo(Math.round(e.currentTarget.scrollTop / ITEM))
          }}
        >
          <div style={{ height: PAD }} aria-hidden="true" />
          {values.map((v, i) => (
            <div
              key={v}
              aria-hidden="true"
              className={`${styles.item} ${i === live ? styles.selected : ''}`}
              onClick={() => { if (!drag.current?.moved) goTo(i) }}
            >
              {format(v)}
            </div>
          ))}
          <div style={{ height: PAD }} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

interface WheelFieldProps {
  /** Titel i panelen, t.ex. "Antal set" */
  title: string
  /** Texten som visas i knappen, t.ex. "3 set" */
  display: string
  columns: WheelColumnSpec[]
  ariaLabel?: string
}

/** Knapp som visar ett värde och öppnar en panel med hjul för att välja. */
export function WheelField({ title, display, columns, ariaLabel }: WheelFieldProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <>
      <button type="button" className={styles.pill} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${ariaLabel ?? title}: ${display}. Tryck för att ändra`} id={id}>
        <span>{display}</span>
        <Icon name="chevronRight" size={12} className={styles.caret} />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={title} hideClose>
        <div className={styles.columns}>
          {columns.map((c) => <WheelColumn key={c.unit} {...c} />)}
        </div>
        <Button variant="primary" fullWidth onClick={() => setOpen(false)}>Klar</Button>
      </BottomSheet>
    </>
  )
}

/** [from, from+step, …, to] utan flyttalsfel */
export const range = (from: number, to: number, step = 1): number[] => {
  const out: number[] = []
  for (let v = from; v <= to + 1e-9; v += step) out.push(Math.round(v * 100) / 100)
  return out
}
