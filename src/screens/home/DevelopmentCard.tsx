import { useState, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { LineChart } from '../../components/ui/LineChart'
import { SortableList } from '../../components/ui/SortableList'
import { StatChip } from '../../components/ui/StatChip'
import { Toggle } from '../../components/ui/Toggle'
import type { Goal } from '../../data/goals'
import { effectiveGoal, workoutsPerMonth, workoutsThisMonth } from '../../data/stats'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { EditGoalSheet } from './EditGoalSheet'
import { GoalRow } from './GoalRow'
import styles from './DevelopmentCard.module.css'

type SectionId = 'goals' | 'stats' | 'chart'
interface Section {
  id: SectionId
  visible: boolean
}

const defaultSections: Section[] = [
  { id: 'goals', visible: true },
  { id: 'stats', visible: true },
  { id: 'chart', visible: true },
]

const sectionLabels: Record<SectionId, string> = {
  goals: 'Mål',
  stats: 'Statistik',
  chart: 'Pass per månad',
}

type SheetState = { mode: 'add' } | { mode: 'edit'; goal: Goal } | null

/** "Din utveckling"-kortet. Pennan växlar till redigeringsläge där sektioner kan döljas/flyttas och mål läggas till/tas bort. */
export function DevelopmentCard() {
  const { history } = useWorkoutStore()
  const monthly = workoutsPerMonth(history)
  const last = monthly[monthly.length - 1]?.value ?? 0
  const prev = monthly[monthly.length - 2]?.value ?? 0
  const trend = last > prev ? 'up' : last === prev ? 'flat' : 'down'
  const [editing, setEditing] = useState(false)
  const { goals, exerciseStats, getExercise, saveGoal: storeSaveGoal, removeGoal } = useWorkoutStore()
  const [sections, setSections] = useLocalStorageState<Section[]>('styrkeloggen-sections', defaultSections)
  const [sheet, setSheet] = useState<SheetState>(null)

  const shown = editing ? sections : sections.filter((s) => s.visible && (s.id !== 'goals' || goals.length > 0))

  function setVisible(id: SectionId, visible: boolean) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible } : s)))
  }

  function saveGoal(values: Omit<Goal, 'id'>) {
    storeSaveGoal(values, sheet?.mode === 'edit' ? sheet.goal.id : undefined)
  }

  function renderContent(id: SectionId): ReactNode {
    switch (id) {
      case 'goals':
        return (
          <div className={styles.goals}>
            {goals.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={{ ...effectiveGoal(goal, goal.exerciseId ? exerciseStats[goal.exerciseId] : undefined), exercise: (goal.exerciseId && getExercise(goal.exerciseId)?.name) || goal.exercise }}
                editing={editing}
                onEdit={() => setSheet({ mode: 'edit', goal })}
                onRemove={() => removeGoal(goal.id)}
              />
            ))}
            {editing && (
              <button type="button" className={styles.addGoal} onClick={() => setSheet({ mode: 'add' })}>
                <Icon name="plus" size={16} />
                Lägg till mål
              </button>
            )}
          </div>
        )
      case 'stats':
        return (
          <div className={styles.stats}>
            <StatChip value={history.length} label="pass totalt" />
            <StatChip value={workoutsThisMonth(history)} label="pass denna månad" align="end" />
          </div>
        )
      case 'chart':
        return (
          <div className={styles.chart}>
            <div className={styles.chartHeader}>
              <span className={styles.chartTitle}>Pass per månad</span>
              {history.length > 0 && (
                <span className={styles.trend}>
                  {trend === 'up' && <Icon name="trendUp" size={14} />}
                  {trend === 'up' ? 'stigande' : trend === 'flat' ? 'jämn' : 'sjunkande'}
                </span>
              )}
            </div>
            <LineChart data={monthly} />
          </div>
        )
    }
  }

  return (
    <Card aria-labelledby="development-title">
      <div className={styles.header}>
        <h2 id="development-title" className={styles.eyebrow}>DIN UTVECKLING</h2>
        <Button
          variant="ghost"
          icon={editing ? 'check' : 'edit'}
          aria-label={editing ? 'Klar med redigering' : 'Redigera Din utveckling'}
          onClick={() => setEditing((e) => !e)}
          style={editing ? { color: 'var(--accent)', borderColor: 'var(--accent)', boxShadow: '0 0 14px -4px var(--accent-glow)' } : undefined}
        />
      </div>

      {shown.length === 0 && (
        <p className={styles.empty}>Inget att visa. Tryck på pennan för att välja vad som ska synas.</p>
      )}

      <SortableList
        items={shown}
        getId={(s) => s.id}
        getLabel={(s) => sectionLabels[s.id]}
        sortable={editing}
        onReorder={setSections}
        renderItem={(section) => (
          <div className={styles.section}>
            {editing && (
              <div className={styles.toggleRow}>
                <Toggle
                  checked={section.visible}
                  onChange={(v) => setVisible(section.id, v)}
                  label={`Visa ${sectionLabels[section.id]}`}
                />
              </div>
            )}
            <div className={editing && !section.visible ? styles.dimmed : undefined}>{renderContent(section.id)}</div>
          </div>
        )}
      />

      <EditGoalSheet
        open={sheet !== null}
        goal={sheet?.mode === 'edit' ? sheet.goal : undefined}
        onClose={() => setSheet(null)}
        onSave={saveGoal}
      />
    </Card>
  )
}
