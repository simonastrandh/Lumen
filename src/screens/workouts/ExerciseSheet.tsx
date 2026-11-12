import { fmtDistance, fmtWeight } from '../../data/units'
import { useRef, useState } from 'react'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { MeasureFields, showFor } from '../../components/pickers/MeasureFields'
import { durationLabel } from '../../components/pickers/TimeField'
import { Tag } from '../../components/ui/Tag'
import { TextField } from '../../components/ui/TextField'
import { cardioMeasureLabel, isCardio, loadLabel, strengthParts, strengthPartLabel, partsOf, toggledMeasure, type CardioMeasure, type Exercise, type ExerciseDefaults, type PbMetric } from '../../data/exercises'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { describeValues } from './labels'
import styles from './Sheets.module.css'

// Övningar är turkosa (pass är lila) så att man ser skillnaden
const teal = { color: 'var(--accent)', borderColor: 'var(--accent)' } as const

interface ExerciseSheetProps {
  exercise: Exercise | null
  onClose: () => void
}

/** Info om en ÖVNING. Kan sparas fristående eller läggas till i ett av dina pass. */
const pbLabel: Record<PbMetric, string> = { kg: 'Vikt', reps: 'Reps', seconds: 'Tid', km: 'Distans' }
const pbValue = (m: PbMetric, v: number) => (m === 'kg' ? fmtWeight(v) : m === 'reps' ? `${v} reps` : m === 'seconds' ? durationLabel(v) : fmtDistance(v))

export function ExerciseSheet({ exercise: selected, onClose }: ExerciseSheetProps) {
  const { workouts, addExerciseToWorkout, setExerciseMeasure, setExerciseDefaults, exerciseStats, commitExerciseValues, renameExercise, deleteExercise, getExercise } = useWorkoutStore()
  const [picking, setPicking] = useState(false)
  const [addedTo, setAddedTo] = useState<string | null>(null)
  // Har något ändrats? Då blir kryssknappen en bock
  const [changed, setChanged] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Värdena när redigeringen började – nya värden som är högre än bästa hittills blir personbästa (PB)
  const before = useRef<{ id?: string; values: ExerciseDefaults }>({ values: {} })
  if (selected && before.current.id !== selected.id) before.current = { id: selected.id, values: { ...(getExercise(selected.id)?.defaults ?? {}) } }
  if (!selected && before.current.id) before.current = { values: {} }

  const close = () => {
    if (selected) commitExerciseValues(selected.id, before.current.values)
    setChanged(false)
    setConfirmDelete(false)
    setPicking(false)
    setAddedTo(null)
    onClose()
  }

  // Hämta aktuell version så att ändrat mått syns direkt
  const exercise = selected ? (getExercise(selected.id) ?? selected) : null
  if (!exercise) return <BottomSheet open={false} onClose={close} title="" children={null} />
  const cardio = isCardio(exercise)
  const d = exercise.defaults ?? {}
  const stats = exerciseStats[exercise.id]
  const shown = showFor(exercise.kind, exercise.measure, exercise.strengthMeasure)
  const pbMetricsShown = (['kg', 'reps', 'seconds', 'km'] as PbMetric[]).filter((m) => shown[m])
  const baseline = (m: PbMetric) => stats?.best[m] ?? before.current.values[m] ?? (m === 'kg' ? 20 : m === 'reps' ? 10 : m === 'seconds' ? 30 : 3)
  const livePbs = pbMetricsShown.filter((m) => d[m] !== undefined && d[m]! > baseline(m))
  const inWorkouts = workouts.filter((w) => w.exercises.some((e) => e.exerciseId === exercise.id)).length

  return (
    <BottomSheet open onClose={close} closeIcon={changed ? 'check' : 'close'} title={exercise.name} eyebrow={<Tag tone="accent">ÖVNING</Tag>}>
      <div className={styles.tags}>
        <Tag>{exercise.muscleGroup}</Tag>
        <Tag>{loadLabel[exercise.load]}</Tag>
      </div>

      {exercise.custom && (
        <TextField
          key={exercise.id}
          label="Namn"
          defaultValue={exercise.name}
          autoComplete="off"
          onBlur={(e) => {
            const n = e.target.value.trim()
            if (n && n !== exercise.name) { setChanged(true); renameExercise(exercise.id, n) }
            else e.target.value = exercise.name
          }}
        />
      )}

      <fieldset className={styles.group}>
        <legend className={styles.label}>Mäts i</legend>
        <div className={styles.chips}>
          {cardio
            ? (['tid', 'distans', 'tid-distans'] as CardioMeasure[]).map((m) => (
                <button key={m} type="button" className={styles.chip} aria-pressed={(exercise.measure ?? 'tid') === m} onClick={() => { setChanged(true); setExerciseMeasure(exercise.id, { measure: m }) }}>
                  {cardioMeasureLabel[m]}
                </button>
              ))
            : strengthParts.map((p) => (
                <button key={p} type="button" className={styles.chip} aria-pressed={partsOf(exercise.strengthMeasure).includes(p)} onClick={() => { setChanged(true); setExerciseMeasure(exercise.id, { strengthMeasure: toggledMeasure(exercise.strengthMeasure ?? 'reps', p) }) }}>
                  {strengthPartLabel[p]}
                </button>
              ))}
        </div>
        <p className={styles.note}>
          {inWorkouts > 0 ? `Ändringen gäller i alla pass med övningen (${inWorkouts} st).` : 'Ändringen gäller i alla pass där du använder övningen.'}
        </p>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.label}>Standard när du lägger till i ett pass</legend>
        <MeasureFields show={shown} values={d} onChange={(patch) => { setChanged(true); setExerciseDefaults(exercise.id, patch) }} />
        <p className={styles.note}>Används för nya pass. Befintliga pass ändras inte.</p>
        {livePbs.length > 0 && (
          <div className={styles.pbRow} role="status">
            <Tag tone="gold" icon="trendUp">NYTT PB</Tag>
            <span>{livePbs.map((m) => `${pbLabel[m]} ${pbValue(m, d[m]!)}`).join(' · ')}</span>
          </div>
        )}
      </fieldset>

      {stats && (stats.last || Object.keys(stats.best).length > 0) && (
        <fieldset className={styles.group}>
          <legend className={styles.label}>Senaste pass och personbästa</legend>
          {stats.last && (
            <p className={styles.note}>
              Senast: {describeValues(stats.last.values)} ({new Date(stats.last.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })})
            </p>
          )}
          {stats.bestSet ? (
            <>
              <div className={styles.chips}><Tag tone="gold" icon="trendUp">BÄSTA SET</Tag><span className={styles.pbRow}>{describeValues(stats.bestSet)}</span></div>
              <p className={styles.note}>Bästa set räknas som ett set: högst distans eller vikt först, sedan längst tid eller flest reps. Värdena hör alltså ihop och är inte bästa värden från olika set.</p>
            </>
          ) : (
            <div className={styles.chips}>
              {pbMetricsShown.filter((m) => stats.best[m] !== undefined).map((m) => (
                <Tag key={m} tone="gold">PB {pbLabel[m]} {pbValue(m, stats.best[m]!)}</Tag>
              ))}
            </div>
          )}
        </fieldset>
      )}

      {!picking ? (
        <div className={styles.actions}>
          <Button variant="secondary" icon="plus" fullWidth onClick={() => setPicking(true)} disabled={workouts.length === 0} style={teal}>
            Lägg till i pass
          </Button>
        </div>
      ) : (
        <div className={styles.picker}>
          <p className={styles.label}>Lägg till i vilket pass?</p>
          {workouts.map((w) => {
            const has = w.exercises.some((e) => e.exerciseId === exercise.id)
            return (
              <button
                key={w.id}
                type="button"
                className={styles.option}
                disabled={has || addedTo === w.id}
                onClick={() => {
                  addExerciseToWorkout(w.id, exercise.id)
                  setAddedTo(w.id)
                }}
              >
                <span>{w.name}</span>
                <span className={styles.optionNote}>{has ? 'Finns redan' : addedTo === w.id ? 'Tillagd ✓' : 'Lägg till'}</span>
              </button>
            )
          })}
          <Button variant="ghost" onClick={() => setPicking(false)} style={{ alignSelf: 'flex-start', padding: '8px 14px', fontSize: 12 }}>
            Klar
          </Button>
        </div>
      )}

      {!picking && (
        confirmDelete ? (
          <Button variant="secondary" fullWidth onClick={() => { deleteExercise(exercise.id); setConfirmDelete(false); setChanged(false); setPicking(false); onClose() }} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            {exercise.custom
              ? `Ja, ta bort övningen${inWorkouts > 0 ? ` (även ur ${inWorkouts} pass)` : ''}`
              : `Ja, ta bort från Mina övningar${inWorkouts > 0 ? ` (även ur ${inWorkouts} pass)` : ''}`}
          </Button>
        ) : (
          <Button variant="ghost" icon="trash" onClick={() => setConfirmDelete(true)} style={{ alignSelf: 'center', padding: '10px 16px', fontSize: 12, color: 'var(--danger)' }}>
            {exercise.custom ? 'Ta bort övning' : 'Ta bort från Mina övningar'}
          </Button>
        )
      )}
    </BottomSheet>
  )
}
