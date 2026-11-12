import { kgToDisplay, weightUnit } from '../../data/units'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
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

/** Sammanfattning efter avslutat pass */
export function Summary({ name, summary }: { name: string; summary: SessionSummary }) {
  const navigate = useNavigate()
  return (
    <>
      <header className={styles.summaryHead}>
        <span className={styles.trophy}><Icon name="flag" size={26} /></span>
        <h1 className={styles.title}>Bra jobbat!</h1>
        <p className={styles.sub}>{name} är avklarat</p>
      </header>
      <div className={styles.stats}>
        <div className={styles.stat}><strong>{formatTime(summary.seconds)}</strong><span>tid</span></div>
        <div className={styles.stat}><strong>{summary.setsDone}</strong><span>set klara</span></div>
        {summary.volume > 0 && <div className={styles.stat}><strong>{Math.round(kgToDisplay(summary.volume))}</strong><span>{weightUnit()} totalt</span></div>}
      </div>
      {summary.pbs.length > 0 && (
        <section className={styles.card} aria-label="Nya personbästa">
          <h2 className={styles.cardTitle}>Nya personbästa</h2>
          {summary.pbs.map((p) => (
            <div key={p.name} className={styles.pbRow}>
              <span>{p.name}</span>
              <Tag tone="gold" icon="trendUp">PB {p.metrics.map((m) => pbLabel[m]).join(' + ')}</Tag>
            </div>
          ))}
        </section>
      )}
      <Button variant="primary" fullWidth onClick={() => navigate('/')}>Klar</Button>
    </>
  )
}
