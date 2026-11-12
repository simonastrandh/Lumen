import { useId, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import styles from './ExercisePicker.module.css'

interface ExercisePickerProps {
  label: string
  value: string
  /** Antingen texter eller { value, label } (value = t.ex. övningens id) */
  options: (string | { value: string; label: string })[]
  onChange: (value: string) => void
  error?: string
  emptyText: string
}

const norm = (s: string) => s.toLocaleLowerCase('sv-SE').trim()

/** Brett fält: klicka för att öppna en vertikal, scrollbar lista som går att söka i (combobox). */
export function ExercisePicker({ label, value, options, onChange, error, emptyText }: ExercisePickerProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const results = opts.filter((o) => !query || norm(o.label).includes(norm(query)))
  const selectedLabel = opts.find((o) => o.value === value)?.label ?? ''

  function choose(v: string) {
    onChange(v)
    setOpen(false)
    setQuery('')
  }

  return (
    <div
      className={styles.wrap}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false)
          setQuery('')
        }
      }}
    >
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={`${styles.field} ${open ? styles.open : ''} ${error ? styles.invalid : ''}`}>
        <Icon name="search" size={18} className={styles.icon} />
        <input
          id={id}
          className={styles.input}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-activedescendant={open && results[active] ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          placeholder="Sök eller välj övning"
          value={open ? query : selectedLabel}
          onFocus={() => { setOpen(true); setActive(0) }}
          onClick={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0) }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
            else if (e.key === 'Enter' && open && results[active]) { e.preventDefault(); choose(results[active].value) }
            else if (e.key === 'Escape' && open) { e.stopPropagation(); e.preventDefault(); setOpen(false); setQuery('') }
          }}
        />
        <Icon name={open ? 'chevronLeft' : 'chevronRight'} size={16} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </div>
      {open && (
        <ul id={`${id}-list`} role="listbox" aria-label={label} className={styles.list}>
          {results.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`${styles.option} ${i === active ? styles.active : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o.value)}
            >
              <span>{o.label}</span>
              {o.value === value && <Icon name="check" size={16} />}
            </li>
          ))}
          {results.length === 0 && <li className={styles.empty}>{opts.length === 0 ? emptyText : 'Inga övningar matchar sökningen.'}</li>}
        </ul>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  )
}
