import styles from './BarChart.module.css'

interface BarChartProps {
  data: { label: string; value: number }[]
  /** Text som läses upp för skärmläsare */
  label: string
  unit?: string
}

/** Stapeldiagram (Figma "per övning"): senaste stapeln är markerad. */
export function BarChart({ data, label, unit = '' }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className={styles.chart} role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value}${unit}`).join(', ')}`}>
      {data.map((d, i) => (
        <div key={d.label + i} className={styles.col}>
          <div className={styles.track}>
            <div className={`${styles.bar} ${i === data.length - 1 ? styles.last : ''}`} style={{ height: `${Math.max(d.value > 0 ? 8 : 3, (d.value / max) * 100)}%` }} />
          </div>
          <span className={styles.label}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}
