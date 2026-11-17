import { kgToDisplay, weightUnit } from '../../data/units'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Tag } from '../../components/ui/Tag'
import { formatTime } from '../../components/pickers/TimeField'
import type { PbMetric } from '../../data/exercises'
import styles from './ActiveWorkout.module.css'

export interface SessionSummary {
  seconds: number
  setsDone: number
  volume: number
  pbs: { name: string; metrics: PbMetric[] }[]
}

const pbLabel: Record<PbMetric, string> = { kg: 'vikt', reps: 'reps', seconds: 'tid', km: 'distans' }

/** Sammanfattning efter avslutat pass: tiden som jättesiffra, set, total vikt och nya personbästa. */
export function Summary({ name, summary }: { name: string; summary: SessionSummary }) {
  const navigate = useNavigate()
  return (
    <div className={styles.summary}>
      <h1 className={styles.summaryTop}>Bra jobbat!</h1>
      <section className={styles.summaryBig} aria-label="Tid">
        <p className={styles.summaryName}>{name} är avklarat</p>
        <p className={styles.summaryTime}>{formatTime(summary.seconds)}</p>
        <p className={styles.sub}>tid</p>
      </section>
      <div className={styles.stats}>
        <div className={styles.stat}><strong>{summary.setsDone}</strong><span>Set klara</span></div>
        {summary.volume > 0 && <div className={styles.stat}><strong>{Math.round(kgToDisplay(summary.volume))}</strong><span>{weightUnit()} totalt</span></div>}
      </div>
      {summary.pbs.length > 0 && (
        <section className={styles.pbCard} aria-label="Nya personbästa">
          <h2 className={styles.cardTitle}>Nya personbästa</h2>
          {summary.pbs.map((p) => (
            <div key={p.name} className={styles.pbRow}>
              <span>{p.name}</span>
              <Tag tone="gold">PB {p.metrics.map((m) => pbLabel[m]).join(' + ')}</Tag>
            </div>
          ))}
        </section>
      )}
      <div className={styles.summaryDone}>
        <Button variant="primary" fullWidth onClick={() => navigate('/')}>Klar</Button>
      </div>
    </div>
  )
}
