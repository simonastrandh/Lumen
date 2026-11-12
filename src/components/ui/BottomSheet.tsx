import { useEffect, useId, useRef, type ReactNode } from 'react'
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

/** Panel som glider upp från botten. Bygger på <dialog> (fokus, Esc och a11y ingår). Scrollar om innehållet är högt. */
export function BottomSheet({ open, onClose, title, eyebrow, children, hideClose, closeIcon = 'close' }: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // Fokus på panelen själv (inte på kryssknappen) så ingen knapp lyser upp direkt när panelen öppnas
      dialog.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      className={styles.sheet}
      aria-labelledby={titleId}
      onClose={(e) => {
        // Stäng bara den här panelen – inte en yttre panel när en inre (t.ex. hjul) stängs
        if (e.target === ref.current) onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose() // klick på bakgrunden
      }}
    >
      {open && (
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
      )}
    </dialog>
  )
}
