import { Icon } from '../../components/ui/Icon'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { durationLabel } from '../../components/pickers/TimeField'
import { fmtValue, unitLabel } from '../../data/units'
import { goalMetrics, goalProgress, isTimeUnit, metricProgress, type Goal, type GoalMetric } from '../../data/goals'
import styles from './GoalRow.module.css'

interface GoalRowProps {
  goal: Goal
  /** I redigeringsläge: raden är klickbar och har en ta-bort-knapp */
  editing?: boolean
  onEdit?: () => void
  onRemove?: () => void
}

const secs = (m: GoalMetric, v: number) => (m.unit === 'min' ? v * 60 : v)
const fmt = (m: GoalMetric, v: number) => (isTimeUnit(m.unit) ? durationLabel(secs(m, v)) : `${fmtValue(m.unit, v)} ${unitLabel(m.unit)}`)
const metricName: Record<string, string> = { kg: 'Vikt', sek: 'Tid', min: 'Tid', km: 'Distans', reps: 'Reps' }

export function GoalRow({ goal, editing, onEdit, onRemove }: GoalRowProps) {
  const metrics: GoalMetric[] = goalMetrics(goal)
  const tracked = metrics.filter((m) => m.target !== undefined)
  const progress = goalProgress(goal)
  const reached = tracked.length > 0 && tracked.every((m) => (metricProgress(m) ?? 0) >= 1)

  // "Nu" och "Mål" visas som en komplett prestation, t.ex. "3 km · 20 min" → "3 km · 15 min".
  // Mått man inte valt som mål hålls oförändrade i målraden.
  const now = metrics.map((m) => fmt(m, m.current)).join(' · ')
  const aim = metrics.map((m) => fmt(m, m.target ?? m.current)).join(' · ')

  const info = (
    <>
      <ProgressRing value={progress} label={`${goal.exercise}-mål, ${Math.round(progress)} procent`} />
      <div className={styles.text}>
        <p className={styles.title}>{goal.exercise}-mål</p>
        <p className={styles.value}>Nu: {now}</p>
        <p className={styles.value}>Mål: <strong className={styles.aim}>{aim}</strong></p>
        <p className={styles.remaining}>
          {reached
            ? 'Målet är nått!'
            : tracked.length > 1
              ? tracked.map((m) => `${metricName[m.unit]} ${Math.round((metricProgress(m) ?? 0) * 100)} %`).join(' · ')
              : `${fmt(tracked[0] ?? goal, Math.abs((tracked[0]?.target ?? 0) - (tracked[0]?.current ?? 0)))} kvar till målet`}
        </p>
      </div>
    </>
  )

  if (!editing) return <div className={styles.row}>{info}</div>

  return (
    <div className={styles.row}>
      <button type="button" className={styles.editArea} onClick={onEdit} aria-label={`Redigera ${goal.exercise}-mål`}>
        {info}
      </button>
      <button type="button" className={styles.remove} onClick={onRemove} aria-label={`Ta bort ${goal.exercise}-mål`}>
        <Icon name="minus" size={14} />
      </button>
    </div>
  )
}
