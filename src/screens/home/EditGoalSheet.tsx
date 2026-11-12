import { useState, type FormEvent } from 'react'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { TimeField, durationLabel } from '../../components/pickers/TimeField'
import { isCardio, partsOf, type Exercise } from '../../data/exercises'
import { autoCurrent } from '../../data/stats'
import { fromDisplay, toDisplay, unitLabel } from '../../data/units'
import { goalMetrics, goalUnitMax, isTimeUnit, type Goal, type GoalMetric, type GoalUnit } from '../../data/goals'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { ExercisePicker } from './ExercisePicker'
import styles from './EditGoalSheet.module.css'

interface EditGoalSheetProps {
  open: boolean
  /** Utelämnad = lägg till nytt mål */
  goal?: Goal
  onClose: () => void
  onSave: (goal: Omit<Goal, 'id'>) => void
}

const unitTitle = (u: GoalUnit) => ({ kg: `Vikt (${unitLabel('kg')})`, min: 'Tid', sek: 'Tid', km: `Distans (${unitLabel('km')})`, reps: 'Repetitioner' })[u]

/** Vilka mått ett mål har utifrån hur övningen mäts (tid, vikt eller båda) */
function metricsFor(ex: Exercise | undefined, legacy: GoalUnit[]): GoalUnit[] {
  if (!ex) return legacy
  if (isCardio(ex)) {
    const m = ex.measure ?? 'tid'
    return m === 'tid' ? ['sek'] : m === 'distans' ? ['km'] : ['sek', 'km']
  }
  const p = partsOf(ex.strengthMeasure)
  const units: GoalUnit[] = []
  if (p.includes('vikt')) units.push('kg')
  if (p.includes('tid')) units.push('sek')
  if (p.includes('reps') && !p.includes('vikt')) units.push('reps')
  return units.length ? units : ['reps']
}

/** Alla mått man kan följa i ett mål för en övning */
function availableUnits(ex: Exercise): GoalUnit[] {
  return isCardio(ex) ? ['sek', 'km'] : ['kg', 'reps', 'sek']
}
const unitChip: Record<GoalUnit, string> = { kg: 'Vikt', reps: 'Reps', sek: 'Tid', min: 'Tid', km: 'Distans' }

/** Nuvarande värde = det som övningen har sparat (vikt, tid, distans eller reps) */
function currentFor(ex: Exercise | undefined, unit: GoalUnit): number {
  const d = ex?.defaults ?? {}
  switch (unit) {
    case 'kg': return d.kg ?? 20
    case 'sek': return isCardio(ex) ? Math.round((d.minutes ?? 20) * 60) : (d.seconds ?? 30)
    case 'km': return d.km ?? 3
    default: return d.reps ?? 10
  }
}

type Values = Partial<Record<GoalUnit, { cur: string; tar: string }>>

export function EditGoalSheet({ open, goal, onClose, onSave }: EditGoalSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={goal ? 'Redigera mål' : 'Nytt mål'}>
      {/* Formuläret monteras bara när sheeten är öppen, så fälten nollställs vid varje öppning */}
      <GoalForm goal={goal} onClose={onClose} onSave={onSave} />
    </BottomSheet>
  )
}

function GoalForm({ goal, onClose, onSave }: Omit<EditGoalSheetProps, 'open'>) {
  const { myExercises, exerciseStats, getExercise } = useWorkoutStore()
  // Målet hör till övningens id. Äldre mål utan id (eller med borttagen övning) behåller sitt namn som "legacy".
  const [exerciseId, setExerciseId] = useState(goal ? (goal.exerciseId && myExercises.some((e) => e.id === goal.exerciseId) ? goal.exerciseId : 'legacy') : '')
  const [submitted, setSubmitted] = useState(false)

  // Bara sparade övningar kan väljas (ett befintligt mål behåller sin övning även om den inte längre finns)
  const options = [
    ...(goal && exerciseId === 'legacy' ? [{ value: 'legacy', label: goal.exercise }] : []),
    ...myExercises.map((e) => ({ value: e.id, label: e.name })),
  ]
  const found = myExercises.find((e) => e.id === exerciseId)
  const ex = found ? getExercise(found.id) : undefined
  const exercise = options.find((o) => o.value === exerciseId)?.label ?? ''
  const stats = found ? exerciseStats[found.id] : undefined

  // Äldre mål i minuter räknas om till sekunder
  const toUnit = (u: GoalUnit): GoalUnit => (u === 'min' ? 'sek' : u)
  const initial: Values = {}
  if (goal) {
    for (const m of goalMetrics(goal)) {
      const f = m.unit === 'min' ? 60 : 1
      initial[toUnit(m.unit)] = { cur: String(toDisplay(m.unit, m.current * f)), tar: m.target === undefined ? '' : String(toDisplay(m.unit, m.target * f)) }
    }
  }
  const [values, setValues] = useState<Values>(initial)

  const legacy = goal ? goalMetrics(goal).map((m) => toUnit(m.unit)) : []
  // Vilka mått målet följer: förvalt utifrån övningen, men man väljer själv (som vid "Mäts i" för övningar)
  const [chosen, setChosen] = useState<GoalUnit[] | null>(goal ? legacy : null)
  const available = ex ? availableUnits(ex) : []
  const units = exercise ? (chosen ?? metricsFor(ex, legacy.length ? legacy : ['kg'])) : []

  function toggleUnit(u: GoalUnit) {
    const next = units.includes(u) ? units.filter((x) => x !== u) : available.filter((x) => x === u || units.includes(x))
    if (next.length === 0) return // minst ett mått
    setChosen(next)
    if (!values[u]) setVal(u, { cur: String(toDisplay(u, autoCurrent(u, stats) ?? currentFor(ex, u))), tar: '' })
  }

  function pickExercise(id: string) {
    setExerciseId(id)
    setChosen(null)
    const next = myExercises.find((e) => e.id === id)
    const e = next ? getExercise(next.id) : undefined
    // Nuvarande förifylls med övningens aktuella vikt/tid; målet fyller man i själv
    const v: Values = {}
    for (const u of metricsFor(e, ['kg'])) v[u] = { cur: String(toDisplay(u, autoCurrent(u, next ? exerciseStats[next.id] : undefined) ?? currentFor(e, u))), tar: '' }
    setValues(v)
  }

  const num = (s: string) => Number(s.replace(',', '.'))
  // "Nuvarande" följer ditt bästa utförda värde när det finns; annars skriver man det själv
  const autoOf = (u: GoalUnit) => {
    const a = autoCurrent(u, stats)
    return a === undefined || isTimeUnit(u) ? a : toDisplay(u, a)
  }
  const curOf = (u: GoalUnit) => autoOf(u) ?? num(values[u]?.cur || '0')
  // Mål är valfria per mått: lämnas ett fält tomt hålls det måttet oförändrat. Minst ett mål krävs.
  const isFilled = (u: GoalUnit) => {
    const t = (values[u]?.tar ?? '').trim()
    return t !== '' && num(t) > 0
  }
  // Ett mått är ett mål bara om det skiljer sig från nuvarande. Är det lika hålls det som det är.
  const isTracked = (u: GoalUnit) => isFilled(u) && num(values[u]!.tar) !== curOf(u)
  const errors: { exercise?: string; any?: string; metrics: Partial<Record<GoalUnit, string>> } = { metrics: {} }
  if (!exercise.trim()) errors.exercise = 'Välj en övning'
  if (exercise && units.length > 0 && !units.some(isTracked)) errors.any = 'Minst ett mål måste skilja sig från nuvarande'
  for (const u of units) {
    const val = values[u] ?? { cur: '0', tar: '' }
    const max = goalUnitMax[u]
    const c = curOf(u), t = num(val.tar || '0')
    const maxShown = Math.round(toDisplay(u, max))
    if (Number.isNaN(c) || c < 0 || c > maxShown) errors.metrics[u] = `Nuvarande ska vara mellan 0 och ${maxShown}`
    else if (isFilled(u) && (Number.isNaN(t) || t > maxShown)) errors.metrics[u] = `Målet ska vara högst ${maxShown}`
  }
  const hasErrors = !!errors.exercise || !!errors.any || Object.keys(errors.metrics).length > 0

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (hasErrors || units.length === 0) return
    const metric = (u: GoalUnit): GoalMetric => {
      const cur = fromDisplay(u, curOf(u))
      const prev = (goal ? goalMetrics(goal) : []).find((m) => toUnit(m.unit) === u)
      const f = prev?.unit === 'min' ? 60 : 1
      return {
        unit: u,
        current: cur,
        target: isTracked(u) ? fromDisplay(u, num(values[u]!.tar)) : undefined,
        // Startvärdet behålls när man redigerar, så att framstegen fortsätter räknas från början
        start: prev?.start !== undefined ? prev.start * f : cur,
      }
    }
    const [first, ...others] = units.map(metric)
    onSave({ exerciseId: exerciseId === 'legacy' ? undefined : exerciseId, exercise: exercise.trim(), ...first, extras: others.length ? others : undefined, extra: undefined })
    onClose()
  }

  const setVal = (u: GoalUnit, patch: Partial<{ cur: string; tar: string }>) =>
    setValues((prev) => ({ ...prev, [u]: { cur: '0', tar: '', ...prev[u], ...patch } }))

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <ExercisePicker
        label="Övning"
        value={exerciseId}
        options={options}
        onChange={pickExercise}
        error={submitted ? errors.exercise : undefined}
        emptyText="Du har inga övningar än. Lägg till en under Pass → Mina övningar först."
      />
      {exercise && available.length > 0 && (
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Mäts i</legend>
          <div className={styles.chips}>
            {available.map((u) => (
              <button key={u} type="button" className={styles.chip} aria-pressed={units.includes(u)} onClick={() => toggleUnit(u)}>
                {unitChip[u]}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {units.map((u) => {
        const val = values[u] ?? { cur: '0', tar: '' }
        const err = submitted ? errors.metrics[u] : undefined
        return (
          <fieldset key={u} className={styles.group}>
            {units.length > 1 && <legend className={styles.legend}>{unitTitle(u)}</legend>}
            <div className={styles.row}>
              {isTimeUnit(u) ? (
                <>
                  {autoOf(u) !== undefined ? (
                    <div className={styles.auto}><span className={styles.autoLabel}>Nuvarande tid</span><strong>{durationLabel(Math.round(u === 'min' ? autoOf(u)! * 60 : autoOf(u)!))}</strong><span className={styles.autoNote}>följer ditt bästa</span></div>
                  ) : (
                    <TimeField label="Nuvarande tid" showLabel allowZero value={num(val.cur) || 0} onChange={(t) => setVal(u, { cur: String(t) })} />
                  )}
                  <TimeField label="Måltid (valfritt)" showLabel optional value={num(val.tar) || 0} onChange={(t) => setVal(u, { tar: String(t) })} error={!!err} />
                </>
              ) : (
                <>
                  {autoOf(u) !== undefined ? (
                    <div className={styles.auto}><span className={styles.autoLabel}>Nuvarande ({unitLabel(u)})</span><strong>{String(autoOf(u)).replace('.', ',')}</strong><span className={styles.autoNote}>följer ditt bästa</span></div>
                  ) : (
                    <TextField label={`Nuvarande (${unitLabel(u)})`} inputMode="decimal" value={val.cur} onChange={(e) => setVal(u, { cur: e.target.value })} />
                  )}
                  <TextField label={`Mål (${unitLabel(u)}, valfritt)`} inputMode="decimal" value={val.tar} onChange={(e) => setVal(u, { tar: e.target.value })} error={err} />
                </>
              )}
            </div>
            {isTimeUnit(u) && err && <p className={styles.error} role="alert">{err}</p>}
          </fieldset>
        )
      })}
      {units.length > 0 && (
        <p className={styles.help}>
          {units.length > 1
            ? 'Minst ett mål måste skilja sig från nuvarande. Lämna övriga tomma eller lika med nuvarande – de hålls då som de är (t.ex. samma sträcka på kortare tid).'
            : 'Nuvarande värde följer ditt bästa utförda värde, eller så skriver du in det själv tills du loggat något.'}
        </p>
      )}
      {submitted && errors.any && <p className={styles.error} role="alert">{errors.any}</p>}
      <div className={styles.actions}>
        <Button variant="primary" type="submit" fullWidth>Spara</Button>
        <Button variant="secondary" onClick={onClose} fullWidth>Avbryt</Button>
      </div>
    </form>
  )
}
