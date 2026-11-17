import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import type { Exercise } from '../../data/exercises'
import { entryForExercise } from '../../data/workouts'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { clearSession, readSession, writeSession } from '../active/session'
import { makeSets } from '../active/helpers'
import styles from './Sheets.module.css'

type Target = { kind: 'workout'; id: string; name: string } | { kind: 'exercise'; exercise: Exercise }

/**
 * Starta ett pass eller en enskild övning. Finns redan ett annat pågående pass frågar vi först,
 * eftersom ett nytt pass avbryter det som pågår.
 */
export function useStartGuard(): { startWorkout: (id: string, name: string) => void; startExercise: (e: Exercise) => void; sheet: ReactNode } {
  const navigate = useNavigate()
  const store = useWorkoutStore()
  const [pending, setPending] = useState<Target | null>(null)

  function go(t: Target) {
    if (t.kind === 'workout') {
      navigate(`/pass/aktivt/${t.id}`)
      return
    }
    // En enskild övning startas som ett tomt pass med bara den övningen
    const ex = store.getExercise(t.exercise.id) ?? t.exercise
    writeSession({ id: 'tomt', startedAt: Date.now(), ei: 0, items: [{ exerciseId: ex.id, sets: makeSets(entryForExercise(ex.id, ex)) }], timer: null })
    navigate('/pass/aktivt/tomt')
  }

  function request(t: Target) {
    const active = readSession()
    const sameWorkout = t.kind === 'workout' && active?.id === t.id
    if (active && !sameWorkout) setPending(t)
    else go(t)
  }

  const name = pending ? (pending.kind === 'workout' ? pending.name : pending.exercise.name) : ''
  const active = readSession()

  const sheet = (
    <BottomSheet open={pending !== null} onClose={() => setPending(null)} title="Du har ett pågående pass">
      <p className={styles.note}>Om du startar {name} avbryts det pågående passet och dess klara set sparas inte.</p>
      <Button variant="primary" fullWidth onClick={() => { const t = pending; setPending(null); clearSession(); if (t) go(t) }}>Starta {name}</Button>
      <Button variant="secondary" fullWidth onClick={() => { setPending(null); if (active) navigate(`/pass/aktivt/${active.id}`) }}>Fortsätt pågående pass</Button>
    </BottomSheet>
  )

  return {
    startWorkout: (id, nm) => request({ kind: 'workout', id, name: nm }),
    startExercise: (e) => request({ kind: 'exercise', exercise: e }),
    sheet,
  }
}
