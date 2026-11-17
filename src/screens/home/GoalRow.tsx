import { Icon } from '../../components/ui/Icon'
import { durationLabel } from '../../components/pickers/TimeField'
import { fmtValue, unitLabel } from '../../data/units'
import { goalMetrics, goalProgress, isTimeUnit, metricProgress, type Goal, type GoalMetric } from '../../data/goals'
import styles from './GoalRow.module.css'

interface GoalRowProps {
  goal: Goal
  /** I redigeringsläge: kortet är klickbart, har ett grepp och en ta-bort-knapp */
  editing?: boolean
  onEdit?: () => void
  onRemove?: () => void
}

const secs = (m: GoalMetric, v: number) => (m.unit === 'min' ? v * 60 : v)
const fmt = (m: GoalMetric, v: number) => (isTimeUnit(m.unit) ? durationLabel(secs(m, v)) : `${fmtValue(m.unit, v)} ${unitLabel(m.unit)}`)

export function GoalRow({ goal, editing, onEdit, onRemove }: GoalRowProps) {
  const metrics: GoalMetric[] = goalMetrics(goal)
  const tracked = metrics.filter((m) => m.target !== undefined)
  const progress = Math.round(goalProgress(goal))
  const reached = tracked.length > 0 && tracked.every((m) => (metricProgress(m) ?? 0) >= 1)

  // "Nu" och "Mål" som en komplett prestation, t.ex. "3 km · 20 min". Mått man inte valt som mål hålls oförändrade.
  const now = metrics.map((m) => fmt(m, m.current)).join(' · ')
  const aim = metrics.map((m) => fmt(m, m.target ?? m.current)).join(' · ')

  const card = (
    <div className={styles.card}>
      <div className={styles.top}>
        <p className={styles.title}>{goal.exercise}-mål</p>
        <span className={styles.percent} aria-label={`${progress} procent`}>{progress} %</span>
      </div>
      <div className={styles.bar} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${goal.exercise}-mål`}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.value}>{reached ? 'Målet är nått!' : `Nu ${now} · Mål ${aim}`}</p>
    </div>
  )

  if (!editing) return <div className={styles.row}>{card}</div>

  return (
    <div className={styles.row}>
      <button type="button" className={styles.editArea} onClick={onEdit} aria-label={`Redigera ${goal.exercise}-mål`}>
        {card}
      </button>
      <button type="button" className={styles.remove} onClick={onRemove} aria-label={`Ta bort ${goal.exercise}-mål`}>
        <Icon name="minus" size={14} />
      </button>
    </div>
  )
}
