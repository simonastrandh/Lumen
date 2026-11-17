import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'
import styles from './BottomSheet.module.css'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** Liten etikett ovanför titeln, t.ex. "PASS" eller "ÖVNING" */
  eyebrow?: ReactNode
  children: ReactNode
  /** Dölj kryssknappen (t.ex. i hjulpanelen där "Klar" stänger) */
  hideClose?: boolean
  /** Ikon i knappen uppe till höger: kryss (standard) eller bock när något ändrats */
  closeIcon?: 'close' | 'check'
}

const EXIT_MS = 220

/** Panel som glider upp från botten. Bygger på <dialog> (fokus, Esc och a11y ingår). Scrollar om innehållet är högt. */
export function BottomSheet({ open, onClose, title, eyebrow, children, hideClose, closeIcon = 'close' }: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  // Innehållet ligger kvar medan panelen glider ut, så den stängs mjukt
  const [shown, setShown] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open) {
      setShown(true)
      setClosing(false)
      if (!dialog.open) {
        dialog.showModal()
        // Fokus på panelen själv (inte på kryssknappen) så ingen knapp lyser upp direkt när panelen öppnas
        dialog.focus()
      }
      return
    }
    if (!dialog.open) {
      setShown(false)
      return
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setClosing(true)
    const t = window.setTimeout(() => {
      if (dialog.open) dialog.close()
      setShown(false)
      setClosing(false)
    }, reduced ? 0 : EXIT_MS)
    return () => window.clearTimeout(t)
  }, [open])

  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      className={`${styles.sheet} ${closing ? styles.closing : ''}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Esc: stäng med animation i stället för direkt
        e.preventDefault()
        onClose()
      }}
      onClose={(e) => {
        // Stäng bara den här panelen – inte en yttre panel när en inre (t.ex. hjul) stängs
        if (e.target === ref.current) onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose() // klick på bakgrunden
      }}
    >
      {shown && (
        <div className={styles.panel}>
        <div className={styles.body}>
          <div className={styles.header}>
            <div>
              {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
              <h2 id={titleId} className={styles.title}>{title}</h2>
            </div>
            {!hideClose && (
              <button type="button" className={styles.close} onClick={onClose} aria-label={closeIcon === 'check' ? 'Klar' : 'Stäng'}>
              <Icon name={closeIcon} size={18} />
            </button>
            )}
          </div>
          {children}
        </div>
        </div>
      )}
    </dialog>
  )
}
