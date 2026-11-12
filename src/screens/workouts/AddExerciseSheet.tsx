import { useEffect, useMemo, useState } from 'react'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { Tag } from '../../components/ui/Tag'
import { SearchField } from '../../components/ui/SearchField'
import { TextField } from '../../components/ui/TextField'
import { ExerciseCard } from './ExerciseCard'
import {
  cardioMeasureLabel,
  exercises as library,
  type CardioMeasure,
  type ExerciseDefaults,
  type Exercise,
  type ExerciseKind,
  type StrengthMeasure,
  strengthParts,
  strengthPartLabel,
  partsOf,
  toggledMeasure,
} from '../../data/exercises'
import { newId, useWorkoutStore } from '../../store/WorkoutStore'
import { MeasureFields, showFor } from '../../components/pickers/MeasureFields'
import styles from './AddExerciseSheet.module.css'

interface AddExerciseSheetProps {
  open: boolean
  onClose: () => void
  /** Anropas när en övning valts eller skapats */
  onPick: (exercise: Exercise) => void
  /** Används inte längre (bläddra-listan är borttagen) */
  pickedIds?: string[]
  /** Text på knappen som skapar övningen */
  submitLabel?: string
  /** Visa först en lista med egna övningar och en knapp för att skapa ny */
  listFirst?: boolean
  /** Vilken typ en ny övning förvalas som (t.ex. passets typ) och vilka som visas först i listan */
  defaultKind?: ExerciseKind
}

const norm = (s: string) => s.toLocaleLowerCase('sv-SE').trim()
const measures: CardioMeasure[] = ['tid', 'distans', 'tid-distans']

/** "Lägg till övning": man skriver in en egen övning (styrka eller kondition, som mäts olika). */
export function AddExerciseSheet({ open, onClose, onPick, submitLabel = 'Lägg till i passet', listFirst = false, defaultKind = 'styrka' }: AddExerciseSheetProps) {
  const { customExercises, addCustomExercise, getExercise, myExercises, savedExerciseIds, toggleSavedExercise } = useWorkoutStore()
  const [creating, setCreating] = useState(!listFirst)
  const [query, setQuery] = useState('')
  const [name, setName] = useState('')
  const [kind, setKind] = useState<ExerciseKind>(defaultKind)
  const [strengthMeasure, setStrengthMeasure] = useState<StrengthMeasure>('reps')
  const [measure, setMeasure] = useState<CardioMeasure>('tid-distans')
  const [defaults, setDefaults] = useState<ExerciseDefaults>({})
  const [error, setError] = useState(false)

  // Passets typ kan ha ändrats sedan sist: förvälj den när rutan öppnas
  useEffect(() => {
    if (open) setKind(defaultKind)
  }, [open, defaultKind])

  const all = useMemo(() => [...customExercises, ...library].map((e) => getExercise(e.id) ?? e), [customExercises, getExercise])
  function reset() {
    setName('')
    setKind(defaultKind)
    setMeasure('tid-distans')
    setStrengthMeasure('reps')
    setDefaults({})
    setError(false)
    setCreating(!listFirst)
    setQuery('')
  }
  const close = () => {
    reset()
    onClose()
  }
  const pick = (e: Exercise) => {
    // Övningar från biblioteket sparas bland Mina övningar när de används (egna sparas redan när de skapas)
    if (!e.custom && !savedExerciseIds.includes(e.id)) toggleSavedExercise(e.id)
    onPick(e)
    reset()
  }

  function createOwn() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError(true)
      return
    }
    // Finns redan en övning med samma namn och typ används den istället för att skapa en dubblett
    const existing = all.find((e) => norm(e.name) === norm(trimmed) && (e.kind ?? 'styrka') === kind)
    if (existing) return pick(existing)
    const created: Exercise =
      kind === 'kondition'
        ? { id: newId(), name: trimmed, muscleGroup: 'Kondition', load: 'kroppsvikt', kind, measure, defaults, custom: true }
        : { id: newId(), name: trimmed, muscleGroup: 'Helkropp', load: 'kg', kind, strengthMeasure, defaults, custom: true }
    addCustomExercise(created)
    pick(created)
  }

  return (
    <BottomSheet open={open} onClose={close} title="Lägg till övning" eyebrow={<Tag tone="accent">ÖVNING</Tag>}>
      {!creating ? (
        <div className={styles.stack}>
          {myExercises.length > 6 && <SearchField value={query} onChange={setQuery} label="Sök bland dina övningar" placeholder="Sök bland dina övningar..." />}
          {myExercises.length === 0 ? (
            <p className={styles.help}>Du har inga sparade övningar än. Skapa din första nedan.</p>
          ) : (
            <div className={styles.results}>
              {[...myExercises]
                .sort((a, b) => Number((b.kind ?? 'styrka') === defaultKind) - Number((a.kind ?? 'styrka') === defaultKind)) // passets typ först
                .filter((e) => norm(e.name).includes(norm(query)))
                .map((e) => (
                  <ExerciseCard key={e.id} exercise={e} layout="row" onOpen={() => pick(e)} />
                ))}
              {query && !myExercises.some((e) => norm(e.name).includes(norm(query))) && <p className={styles.help}>Inga träffar på ”{query}”.</p>}
            </div>
          )}
          <Button variant="secondary" icon="plus" fullWidth onClick={() => { setName(query); setCreating(true) }}>
            Skapa ny övning
          </Button>
        </div>
      ) : (
        <div className={styles.stack}>
          {listFirst && (
            <button type="button" className={styles.backLink} onClick={() => setCreating(false)}>
              <Icon name="chevronLeft" size={14} /> Tillbaka till mina övningar
            </button>
          )}
          <TextField
            label="Namn på övningen"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && createOwn()}
            placeholder="t.ex. Bänkpress eller Löpning"
            error={error ? 'Skriv ett namn på övningen' : undefined}
            autoComplete="off"
          />

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Typ av övning</legend>
            <div className={styles.segment}>
              {(['styrka', 'kondition'] as const).map((k) => (
                <button key={k} type="button" className={styles.segBtn} aria-pressed={kind === k} onClick={() => setKind(k)}>
                  <Icon name={k === 'styrka' ? 'workout' : 'bolt'} size={16} />
                  {k === 'styrka' ? 'Styrka' : 'Kondition'}
                </button>
              ))}
            </div>
            <p className={styles.help}>
              {kind === 'styrka' ? 'Mäts alltid i set. Välj sedan hur du mäter den: reps, tid och/eller vikt – blanda som du vill.' : 'Mäts i tid, distans eller båda.'}
            </p>
          </fieldset>

          {kind === 'styrka' ? (
            <>
            <fieldset className={styles.group}>
              <legend className={styles.legend}>Mäts i</legend>
              <div className={styles.chips}>
                {strengthParts.map((p) => {
                  const on = partsOf(strengthMeasure).includes(p)
                  return (
                    <button key={p} type="button" className={styles.chip} aria-pressed={on} onClick={() => setStrengthMeasure(toggledMeasure(strengthMeasure, p))}>
                      {strengthPartLabel[p]}
                    </button>
                  )
                })}
              </div>
            </fieldset>
            </>
          ) : (
            <fieldset className={styles.group}>
              <legend className={styles.legend}>Mäts i</legend>
              <div className={styles.chips}>
                {measures.map((m) => (
                  <button key={m} type="button" className={styles.chip} aria-pressed={measure === m} onClick={() => setMeasure(m)}>
                    {cardioMeasureLabel[m]}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Standardvärden</legend>
            <MeasureFields show={showFor(kind, measure, strengthMeasure)} values={defaults} onChange={(patch) => setDefaults((d) => ({ ...d, ...patch }))} />
          </fieldset>

          <Button variant="primary" icon="plus" fullWidth onClick={createOwn}>
            {submitLabel}
          </Button>
        </div>
      )}
    </BottomSheet>
  )
}
