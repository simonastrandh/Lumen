import { useId, type InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

/** Pill-formad input med label och felmeddelande. */
export function TextField({ label, error, id, ...rest }: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>{label}</label>
      <input
        id={inputId}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && <p id={`${inputId}-error`} className={styles.error}>{error}</p>}
    </div>
  )
}
