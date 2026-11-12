import type { InputHTMLAttributes } from 'react'
import { Icon } from './Icon'
import styles from './SearchField.module.css'

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  label: string
}

/** Pill-format sökfält med sökikon och rensa-knapp. */
export function SearchField({ value, onChange, label, ...rest }: SearchFieldProps) {
  return (
    <div className={styles.field}>
      <Icon name="search" size={18} className={styles.icon} />
      <input
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        {...rest}
      />
      {value && (
        <button type="button" className={styles.clear} onClick={() => onChange('')} aria-label="Rensa sökning">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  )
}
