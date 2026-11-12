import styles from './StatChip.module.css'

interface StatChipProps {
  value: string | number
  label: string
  align?: 'start' | 'end'
}

export function StatChip({ value, label, align = 'start' }: StatChipProps) {
  return (
    <div className={styles.chip} style={{ alignItems: align === 'end' ? 'flex-end' : 'flex-start' }}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
