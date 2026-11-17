import { Icon } from '../../components/ui/Icon'
import styles from './StartButton.module.css'

/** Liten Starta-knapp på en rad (pass eller övning). Skärmläsare får hela namnet, t.ex. "Starta Push". */
export function StartButton({ label, highlight, onClick }: { label: string; highlight?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`${styles.start} ${highlight ? styles.highlight : ''}`} onClick={onClick} aria-label={label}>
      <Icon name="play" size={14} />
      Starta
    </button>
  )
}
