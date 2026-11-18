import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { formatTime } from '../../components/pickers/TimeField'
import { isCardio, type Exercise, type ExerciseDefaults, type PbMetric } from '../../data/exercises'
import { entryForExercise } from '../../data/workouts'
import { useSettings } from '../../store/SettingsStore'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { EditSetSheet } from './EditSetSheet'
import { makeSets, timerRemaining, type Item, type Timer } from './helpers'
import { clearSession, readSession, writeSession } from './session'
import { SetList } from './SetList'
import { Summary, type SessionSummary } from './Summary'
import { TimerPanel } from './TimerPanel'
import { useWakeLock } from './useWakeLock'
import { ManageExercisesSheet } from './ManageExercisesSheet'
import { AddExerciseSheet } from '../workouts/AddExerciseSheet'
import styles from './ActiveWorkout.module.css'

/**
 * Aktivt pass: en övning i taget, en timer, set som bockas av.
 * Passet sparas löpande (överlever omladdning), skärmen hålls tänd och avslutade pass loggas
 * (historik för rotationen, senaste pass och personbästa). Ett tomt pass börjar utan övningar som man lägger till själv.
 */
export default function ActiveWorkout() {
  const { id = '' } = useParams()
  // En ny instans per pass, så att tillståndet inte följer med när man byter pass i samma sida
  return <ActiveWorkoutInner key={id} />
}

function ActiveWorkoutInner() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const store = useWorkoutStore()
  const { getExercise } = store
  const { defaultRest } = useSettings()
  const isEmpty = id === 'tomt'
  const workout = !isEmpty ? store.getWorkout(id) : undefined

  // Återuppta ett sparat pass om det gäller samma pass
  const saved = useRef(readSession()).current
  const resume = saved && saved.id === id ? saved : null

  const startedAt = useRef(resume?.startedAt ?? Date.now())
  const [now, setNow] = useState(Date.now())
  const [ei, setEi] = useState(resume?.ei ?? 0)
  const [items, setItems] = useState<Item[]>(() => resume?.items ?? (workout?.exercises ?? []).map((we) => ({ exerciseId: we.exerciseId, sets: makeSets(we) })))
  const [timer, setTimer] = useState<Timer | null>(resume?.timer ?? null)
  const [editing, setEditing] = useState<{ ei: number; si: number } | null>(null)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [managing, setManaging] = useState(false)
  const [replacing, setReplacing] = useState<number | null>(null)
  const [confirmReplace, setConfirmReplace] = useState<number | null>(null)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const finishedAlarm = useRef(false)
  // Text som läses upp för skärmläsare (vila slut, ny övning, set klart)
  const [announce, setAnnounce] = useState('')

  const missing = !isEmpty && !workout && !resume
  // Ett annat pass är redan sparat som pågående: fråga innan det skrivs över
  const [proceed, setProceed] = useState(false)
  const blocked = !!saved && saved.id !== id && !proceed
  useWakeLock(!summary && !missing && !blocked)

  // Spara passet löpande
  useEffect(() => {
    if (summary || missing || blocked) return
    writeSession({ id, startedAt: startedAt.current, ei, items, timer })
  }, [id, ei, items, timer, summary, missing, blocked])

  // En tick var 250 ms driver både totalklockan och timern (räknar mot klockslag, så den går rätt även om fliken sover)
  useEffect(() => {
    if (summary) return
    const t = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [summary])

  const item = items[ei]
  const exercise = item ? getExercise(item.exerciseId) : undefined
  const cardio = isCardio(exercise)
  const current = item?.sets ?? []
  // Vilan hör till övningen (tung bänkpress vill ha längre vila än sidolyft) och sparas där
  const restFor = (i: number) => getExercise(items[i]?.exerciseId ?? '')?.defaults?.rest ?? defaultRest
  const restSeconds = restFor(ei)

  const remaining = timerRemaining(timer, now)

  function updateSets(e: number, f: (sets: Item['sets']) => Item['sets']) {
    setItems((prev) => prev.map((it, i) => (i === e ? { ...it, sets: f(it.sets) } : it)))
  }

  function startTimer(kind: 'rest' | 'work', total: number, e: number, s: number) {
    finishedAlarm.current = false
    setTimer({ kind, total, endAt: Date.now() + total * 1000, ei: e, si: s })
  }

  function startSetTimer(s: number, e = ei) {
    const st = items[e].sets[s]
    finishedAlarm.current = false
    if (st.seconds !== undefined) startTimer('work', st.seconds, e, s)
    else if (st.minutes !== undefined) startTimer('work', Math.round(st.minutes * 60), e, s)
    else setTimer({ kind: 'stopwatch', startAt: Date.now(), ei: e, si: s })
  }

  function completeSet(e: number, s: number, done = true) {
    updateSets(e, (list) => list.map((x, j) => (j === s ? { ...x, done } : x)))
    setAnnounce(done ? `Set ${s + 1} klart` : `Set ${s + 1} ej klart`)
    if (!done) return
    const isLastOfAll = e === items.length - 1 && items[e].sets.every((x, j) => j === s || x.done)
    // Vila startar automatiskt efter ett set (inte efter konditionspass med ett set, och inte efter allra sista setet)
    if (!isCardio(getExercise(items[e].exerciseId)) && !isLastOfAll) startTimer('rest', restFor(e), e, s)
    else setTimer(null)
  }

  // Timern nådde noll: ett set med tid blir klart och vilan startar, en vila bara slutar. Telefonen vibrerar om den kan.
  useEffect(() => {
    if (!timer || timer.kind === 'stopwatch' || remaining > 0 || finishedAlarm.current) return
    finishedAlarm.current = true
    navigator.vibrate?.([200, 100, 200])
    setAnnounce(timer.kind === 'work' ? 'Tiden är slut. Setet är klart.' : 'Vilan är slut.')
    if (timer.kind === 'work') completeSet(timer.ei, timer.si)
    else setTimer(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, timer])

  const totalSets = items.reduce((n, it) => n + it.sets.length, 0)
  const doneSets = items.reduce((n, it) => n + it.sets.filter((x) => x.done).length, 0)

  function goTo(i: number) {
    if (timer && timer.kind !== 'rest') setTimer(null)
    setEi(i)
    const target = items[i]
    if (target) setAnnounce(`Övning ${i + 1} av ${items.length}: ${getExercise(target.exerciseId)?.name ?? ''}`)
  }

  function addExercise(e: Exercise) {
    // En nyskapad egen övning finns inte i butiken förrän nästa rendering, så använd objektet vi fick
    const entry = entryForExercise(e.id, getExercise(e.id) ?? e)
    if (replacing !== null) {
      const at = replacing
      if (timer && timer.ei === at) setTimer(null)
      setItems((prev) => prev.map((it, k) => (k === at ? { exerciseId: e.id, sets: makeSets(entry) } : it)))
      setReplacing(null)
      setAdding(false)
      setManaging(true)
      return
    }
    setItems((prev) => [...prev, { exerciseId: e.id, sets: makeSets(entry) }])
    setAdding(false)
    goTo(items.length)
  }

  function reorderExercises(order: number[]) {
    setItems((prev) => order.map((o) => prev[o]))
    setEi((cur) => Math.max(0, order.indexOf(cur)))
    setTimer((t) => (t ? { ...t, ei: Math.max(0, order.indexOf(t.ei)) } : t))
  }

  function removeExercise(i: number) {
    // En pågående timer följer med sin övning, eller avbryts om det är den som tas bort
    setTimer((t) => (!t || t.ei === i ? null : t.ei > i ? { ...t, ei: t.ei - 1 } : t))
    setItems((prev) => prev.filter((_, k) => k !== i))
    setEi((cur) => Math.max(0, Math.min(cur > i ? cur - 1 : cur, items.length - 2)))
  }

  function discard() {
    clearSession()
    navigate('/')
  }

  function finish() {
    const done = (it: Item) => it.sets.filter((x) => x.done)
    const results = items.filter((it) => done(it).length > 0).map((it) => {
      const sets = done(it).map(({ done: _d, ...v }) => v as ExerciseDefaults)
      const max = (k: PbMetric) => {
        const vals = sets.map((x) => x[k]).filter((v): v is number => v !== undefined)
        return vals.length ? Math.max(...vals) : undefined
      }
      return { exerciseId: it.exerciseId, values: { kg: max('kg'), reps: max('reps'), seconds: max('seconds'), km: max('km') } as ExerciseDefaults, sets }
    })
    const pbs = store.recordSession(results)
    const volume = items.reduce((v, it) => v + done(it).reduce((a, x) => a + (x.kg ?? 0) * (x.reps ?? 0), 0), 0)
    const seconds = Math.round((Date.now() - startedAt.current) / 1000)
    // Loggar passet i statistiken: tid, set, total vikt och varje klart set per övning
    store.completeWorkout(workout?.id ?? null, workout?.name ?? 'Tomt pass', {
      durationSeconds: seconds,
      setsDone: doneSets,
      volume,
      exercises: results.map((r) => ({ exerciseId: r.exerciseId, name: getExercise(r.exerciseId)?.name ?? 'Övning', sets: r.sets })),
      pbs,
    })
    clearSession()
    setTimer(null)
    setConfirmEnd(false)
    setSummary({ seconds, setsDone: doneSets, volume, pbs: pbs.map((p) => ({ name: getExercise(p.exerciseId)?.name ?? 'Övning', metrics: p.metrics })) })
  }

  const requestFinish = () => (doneSets < totalSets || doneSets === 0 ? setConfirmEnd(true) : finish())

  if (blocked && saved) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Du har ett pågående pass</h1>
        <p className={styles.empty}>Om du startar det här passet avbryts det pågående passet och dess klara set sparas inte.</p>
        <Button variant="primary" fullWidth onClick={() => setProceed(true)}>Starta det här passet</Button>
        <Button variant="secondary" fullWidth onClick={() => navigate(`/pass/aktivt/${saved.id}`, { replace: true })}>Fortsätt pågående pass</Button>
      </div>
    )
  }
  if (missing) return <p style={{ color: 'var(--text-secondary)' }}>Passet finns inte längre.</p>
  if (summary) return <Summary name={workout?.name ?? 'Tomt pass'} summary={summary} />

  const nextUndone = current.findIndex((x) => !x.done)
  const nextSet = nextUndone >= 0 ? current[nextUndone] : undefined
  const isLast = ei === items.length - 1
  const name = workout?.name ?? 'Tomt pass'

  const header = (
    <header className={styles.header}>
      <div className={styles.headText}>
        <p className={styles.sub}>{items.length > 0 ? `${name} · övning ${ei + 1} av ${items.length}` : 'Pågående'}</p>
        <h1 className={styles.title}>{exercise?.name ?? name}</h1>
      </div>
      <div className={styles.headTools}>
        <button type="button" className={styles.addEx} onClick={() => setManaging(true)} aria-label="Ändra övningar i passet">
          <Icon name="edit" size={16} />
        </button>
        <span className={styles.clock} role="timer" aria-label="Total tid">
          <Icon name="clock" size={14} /> {formatTime(Math.round((now - startedAt.current) / 1000))}
        </span>
      </div>
    </header>
  )

  const addSheet = (
    <>
      <ManageExercisesSheet
        open={managing}
        onClose={() => setManaging(false)}
        exercises={items.map((it) => ({ name: getExercise(it.exerciseId)?.name ?? 'Övning' }))}
        onReorder={reorderExercises}
        onRemove={removeExercise}
        onReplace={(i) => {
          if (items[i].sets.some((x) => x.done)) setConfirmReplace(i)
          else { setReplacing(i); setManaging(false); setAdding(true) }
        }}
        onAdd={() => { setManaging(false); setAdding(true) }}
      />
      <BottomSheet open={confirmReplace !== null} onClose={() => setConfirmReplace(null)} title="Byta övning?">
        <p className={styles.sub}>Du har redan bockat av set på den här övningen. Byter du ut den sparas inte de seten.</p>
        <Button variant="primary" fullWidth onClick={() => { setReplacing(confirmReplace); setConfirmReplace(null); setManaging(false); setAdding(true) }}>Byt ändå</Button>
        <Button variant="secondary" fullWidth onClick={() => setConfirmReplace(null)}>Behåll övningen</Button>
      </BottomSheet>
      <AddExerciseSheet open={adding} onClose={() => { setAdding(false); if (replacing !== null) { setReplacing(null); setManaging(true) } }} listFirst onPick={addExercise} title={replacing !== null ? 'Byt övning' : undefined} submitLabel={replacing !== null ? 'Byt till övningen' : 'Lägg till i passet'} />
    </>
  )

  // Tomt pass utan övningar än
  if (items.length === 0) {
    return (
      <div className={styles.page}>
        {header}
        <p className={styles.empty}>Ett tomt pass. Lägg till de övningar du gör, en i taget, och avsluta när du är klar. Tiden går i högra hörnet.</p>
        <Button variant="primary" icon="plus" fullWidth onClick={() => setAdding(true)}>Lägg till övning</Button>
        <Button variant="secondary" fullWidth onClick={discard} className={styles.end}>Avbryt pass</Button>
        {addSheet}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="sr-only" role="status" aria-live="polite">{announce}</div>
      {header}

      {items.length > 1 && <div className={styles.dots} role="list" aria-label="Övningar i passet">
        {items.map((it, i) => (
          <button key={i} type="button" role="listitem" className={`${styles.dot} ${i === ei ? styles.dotActive : ''} ${it.sets.every((x) => x.done) ? styles.dotDone : ''}`} aria-label={`Gå till ${getExercise(it.exerciseId)?.name}`} aria-current={i === ei} onClick={() => goTo(i)} />
        ))}
      </div>}

      <TimerPanel
        timer={timer}
        now={now}
        nextSet={nextSet}
        nextIndex={nextUndone}
        totalSets={current.length}
        exerciseName={exercise?.name ?? 'övningen'}
        restSeconds={restSeconds}
        onRestChange={(rest) => exercise && store.setExerciseDefaults(exercise.id, { rest })}
        onTimerChange={setTimer}
        onStartSetTimer={(si) => startSetTimer(si)}
        onStartRest={(total, si) => startTimer('rest', total, ei, si)}
        onCompleteSet={completeSet}
      />

      <SetList
        sets={current}
        ei={ei}
        cardio={cardio}
        timer={timer}
        onEdit={(si) => setEditing({ ei, si })}
        onToggle={(si, done) => completeSet(ei, si, done)}
        onStartTimer={(si) => startSetTimer(si)}
        onAddSet={() => updateSets(ei, (l) => [...l, { ...l[l.length - 1], done: false }])}
      />

      <div className={styles.nav}>
        <button type="button" className={styles.prev} disabled={ei === 0} onClick={() => goTo(ei - 1)} aria-label="Föregående övning">
          <Icon name="chevronLeft" size={20} />
        </button>
        {isLast ? (
          <Button variant="primary" fullWidth icon="flag" onClick={requestFinish}>Avsluta pass</Button>
        ) : (
          <Button variant="primary" fullWidth onClick={() => goTo(ei + 1)}>Nästa övning →</Button>
        )}
      </div>
      {!isLast && (
        <Button variant="secondary" fullWidth onClick={requestFinish} className={styles.end}>
          Avsluta pass
        </Button>
      )}

      <EditSetSheet
        open={!!editing}
        title={editing ? (cardio ? 'Ändra värden' : `Ändra set ${editing.si + 1}`) : ''}
        set={editing ? items[editing.ei]?.sets[editing.si] : undefined}
        canRemove={!!editing && (items[editing.ei]?.sets.length ?? 0) > 1}
        onChange={(patch) => editing && updateSets(editing.ei, (l) => l.map((x, j) => (j === editing.si ? { ...x, ...patch } : x)))}
        onRemove={() => { if (editing) updateSets(editing.ei, (l) => l.filter((_, j) => j !== editing.si)); setEditing(null) }}
        onClose={() => setEditing(null)}
      />

      <BottomSheet open={confirmEnd} onClose={() => setConfirmEnd(false)} title={doneSets === 0 ? 'Inget set klart' : 'Avsluta passet?'}>
        <p className={styles.sub}>
          {doneSets === 0
            ? 'Du har inte bockat av något set. Ett pass utan klara set sparas inte i statistiken.'
            : `Du har ${totalSets - doneSets} set kvar. Avslutar du nu sparas bara de set du bockat av.`}
        </p>
        {doneSets > 0 && <Button variant="primary" fullWidth onClick={finish}>Avsluta ändå</Button>}
        <Button variant="secondary" fullWidth onClick={() => setConfirmEnd(false)}>Fortsätt träna</Button>
        <Button variant="ghost" icon="trash" onClick={discard} style={{ alignSelf: 'center', color: 'var(--danger)', padding: '10px 16px', fontSize: 12 }}>
          Avbryt pass utan att spara
        </Button>
      </BottomSheet>

      {addSheet}
    </div>
  )
}
