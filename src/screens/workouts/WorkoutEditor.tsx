import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { SortableList } from '../../components/ui/SortableList'
import { MeasureFields } from '../../components/pickers/MeasureFields'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { TextField } from '../../components/ui/TextField'
import { Tag } from '../../components/ui/Tag'
import { isCardio, type Exercise } from '../../data/exercises'
import { entryForExercise, type Workout, type WorkoutExercise } from '../../data/workouts'
import { newId, useWorkoutStore } from '../../store/WorkoutStore'
import { AddExerciseSheet } from './AddExerciseSheet'
import styles from './WorkoutEditor.module.css'

/** Skapa (/pass/ny) eller redigera (/pass/:id) ett pass. */
export default function WorkoutEditor() {
  const { id } = useParams()
  const store = useWorkoutStore()
  const existing = id && id !== 'ny' ? store.getWorkout(id) : undefined

  if (id && id !== 'ny' && !existing) {
    return <p style={{ color: 'var(--text-secondary)' }}>Passet finns inte längre.</p>
  }
  // key så att formuläret nollställs när man byter pass
  return <Editor key={existing?.id ?? 'ny'} initial={existing} />
}

function Editor({ initial }: { initial?: Workout }) {
  const navigate = useNavigate()
  const store = useWorkoutStore()
  const [name, setName] = useState(initial?.name ?? '')
  const [items, setItems] = useState<(WorkoutExercise & { key: string })[]>(
    () => (initial?.exercises ?? []).map((e) => ({ ...e, key: newId() })),
  )
  const [kind, setKind] = useState<'styrka' | 'kondition'>(initial?.kind ?? 'styrka')
  const [picking, setPicking] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const nameError = !name.trim() ? 'Ge passet ett namn' : undefined
  const exercisesError = items.length === 0 ? 'Lägg till minst en övning i passet' : undefined
  const update = (key: string, patch: Partial<WorkoutExercise>) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)))

  function save() {
    setShowErrors(true)
    if (nameError || exercisesError) return
    store.saveWorkout({
      id: initial?.id ?? newId(),
      name: name.trim(),
      kind,
      exercises: items.map(({ key: _key, ...rest }) => rest),
    })
    navigate('/pass')
  }

  function addExercise(e: Exercise) {
    const entry: WorkoutExercise = entryForExercise(e.id, store.getExercise(e.id) ?? e)
    setItems((prev) => [...prev, { ...entry, key: newId() }])
    setPicking(false)
  }

  return (
    <>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/pass')} aria-label="Tillbaka till Pass">
          <Icon name="chevronLeft" size={20} />
        </button>
        <div>
          <Tag tone="accent-2" icon="layers">PASS</Tag>
          <h1 className={styles.title}>{initial ? 'Redigera pass' : 'Nytt pass'}</h1>
        </div>
      </header>

      <SegmentedControl label="Typ av pass" value={kind} onChange={setKind} options={[{ value: 'styrka', label: 'Styrkepass' }, { value: 'kondition', label: 'Konditionspass' }]} />

      <TextField label="Namn" value={name} onChange={(e) => setName(e.target.value)} placeholder="t.ex. Push-dagen" error={showErrors ? nameError : undefined} autoComplete="off" />

      <section className={styles.section}>
        <h2 className={styles.label}>ÖVNINGAR ({items.length})</h2>
        {items.length > 0 ? (
          <div className={styles.listCard}>
            <SortableList
              items={items}
              getId={(i) => i.key}
              getLabel={(i) => store.getExercise(i.exerciseId)?.name ?? 'övning'}
              sortable
              onReorder={setItems}
              renderItem={(i) => {
                const ex = store.getExercise(i.exerciseId)
                return (
                  <div className={styles.exercise}>
                    <div className={styles.exerciseMain}>
                      <div className={styles.exerciseText}>
                        <span className={styles.exerciseName}>{ex?.name}</span>
                        <span className={styles.exerciseMuscle}>{ex?.muscleGroup}</span>
                      </div>
                    <MeasureFields
                      show={{ sets: !isCardio(ex), reps: !isCardio(ex) && i.reps > 0, kg: i.kg !== undefined, seconds: i.seconds !== undefined, minutes: i.minutes !== undefined, km: i.km !== undefined }}
                      values={i}
                      onChange={(patch) => update(i.key, patch)}
                    />
                    {!isCardio(ex) && (
                      <div className={styles.optional}>
                        <button type="button" className={styles.optBtn} aria-pressed={i.kg !== undefined} onClick={() => update(i.key, { kg: i.kg === undefined ? 20 : undefined })}>
                          <Icon name={i.kg === undefined ? 'plus' : 'check'} size={12} /> Vikt
                        </button>
                        <button type="button" className={styles.optBtn} aria-pressed={i.seconds !== undefined} onClick={() => update(i.key, { seconds: i.seconds === undefined ? 30 : undefined, ...(i.seconds !== undefined && i.reps === 0 ? { reps: 10 } : {}) })}>
                          <Icon name={i.seconds === undefined ? 'plus' : 'check'} size={12} /> Tid
                        </button>
                      </div>
                    )}
                    </div>
                    <button type="button" className={styles.remove} onClick={() => setItems((prev) => prev.filter((x) => x.key !== i.key))} aria-label={`Ta bort ${ex?.name}`}>
                        <Icon name="minus" size={14} />
                      </button>
                  </div>
                )
              }}
            />
          </div>
        ) : null}
        {showErrors && exercisesError && (
          <p id="exercises-error" role="alert" className={styles.error}>{exercisesError}</p>
        )}
        <Button variant="tonal" icon="plus" fullWidth onClick={() => setPicking(true)}>
          Lägg till övning
        </Button>
      </section>

      <div className={styles.actions}>
        <Button variant="primary" fullWidth onClick={save}>Spara pass</Button>
        {initial && (
          confirmDelete ? (
            <Button variant="secondary" fullWidth onClick={() => { store.deleteWorkout(initial.id); navigate('/pass') }} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
              Ja, ta bort passet
            </Button>
          ) : (
            <Button variant="ghost" icon="trash" onClick={() => setConfirmDelete(true)} style={{ alignSelf: 'center', padding: '10px 16px', fontSize: 12, color: 'var(--danger)' }}>
              Ta bort pass
            </Button>
          )
        )}
      </div>

      <AddExerciseSheet open={picking} onClose={() => setPicking(false)} listFirst defaultKind={kind} onPick={addExercise} pickedIds={items.map((i) => i.exerciseId)} />
    </>
  )
}

