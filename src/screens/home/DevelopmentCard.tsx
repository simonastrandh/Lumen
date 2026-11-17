import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { SortableList } from '../../components/ui/SortableList'
import type { Goal } from '../../data/goals'
import { effectiveGoal } from '../../data/stats'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { EditGoalSheet } from './EditGoalSheet'
import { GoalRow } from './GoalRow'
import styles from './DevelopmentCard.module.css'

type SheetState = { mode: 'add' } | { mode: 'edit'; goal: Goal } | null

/** "Din utveckling": dina mål. Pennan växlar till redigeringsläge där mål kan läggas till, tas bort och flyttas. */
export function DevelopmentCard() {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const { goals, exerciseStats, getExercise, saveGoal: storeSaveGoal, removeGoal, reorderGoals } = useWorkoutStore()
  const [sheet, setSheet] = useState<SheetState>(null)

  function saveGoal(values: Omit<Goal, 'id'>) {
    storeSaveGoal(values, sheet?.mode === 'edit' ? sheet.goal.id : undefined)
  }

  const show = (goal: Goal) => ({
    ...effectiveGoal(goal, goal.exerciseId ? exerciseStats[goal.exerciseId] : undefined),
    exercise: (goal.exerciseId && getExercise(goal.exerciseId)?.name) || goal.exercise,
  })

  return (
    <section className={styles.wrap} aria-labelledby="development-title">
      <div className={styles.header}>
        <h2 id="development-title" className={styles.title}>Din utveckling</h2>
        <Button
          variant="ghost"
          icon={editing ? 'check' : 'edit'}
          aria-label={editing ? 'Klar med redigering' : 'Redigera Din utveckling'}
          onClick={() => setEditing((e) => !e)}
        />
      </div>

      {goals.length === 0 && !editing && <p className={styles.empty}>Inga mål än. Tryck på pennan för att lägga till ett.</p>}

      <SortableList
        items={goals}
        getId={(g) => g.id}
        getLabel={(g) => `${g.exercise}-mål`}
        sortable={editing}
        onReorder={(next) => reorderGoals(next.map((g) => g.id))}
        renderItem={(goal) => (
          <GoalRow goal={show(goal)} editing={editing} onEdit={() => setSheet({ mode: 'edit', goal })} onRemove={() => removeGoal(goal.id)} />
        )}
      />

      {editing ? (
        <div key="edit" className="reveal" style={{ display: 'contents' }}>
          <Button variant="secondary" icon="plus" fullWidth onClick={() => setSheet({ mode: 'add' })}>
            Lägg till mål
          </Button>
          {goals.length > 1 && <p className={styles.hint}>Håll och dra i de tre strecken för att ändra ordning.</p>}
        </div>
      ) : (
        <button key="more" type="button" className={`${styles.more} reveal`} onClick={() => navigate('/statistik')}>
          Se all statistik
          <Icon name="chevronRight" size={16} />
        </button>
      )}

      <EditGoalSheet
        open={sheet !== null}
        goal={sheet?.mode === 'edit' ? sheet.goal : undefined}
        onClose={() => setSheet(null)}
        onSave={saveGoal}
      />
    </section>
  )
}
