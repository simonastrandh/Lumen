import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { useWorkoutStore } from '../../store/WorkoutStore'
import styles from './GettingStarted.module.css'

/** Startguide för nya användare: tre steg som bockas av när de är gjorda. Försvinner när första passet är loggat. */
export function GettingStarted() {
  const navigate = useNavigate()
  const { myExercises, workouts, history } = useWorkoutStore()
  if (history.length > 0) return null

  const first = workouts[0]
  const steps = [
    { done: myExercises.length > 0 || workouts.some((w) => w.exercises.length > 0), text: 'Lägg till en övning', hint: 'Skriv in en övning du gör, t.ex. Bänkpress eller Löpning.', go: () => navigate('/pass') },
    { done: workouts.length > 0, text: 'Skapa ett pass', hint: 'Ett pass är en lista övningar du tränar i en följd.', go: () => navigate('/pass/ny') },
    { done: false, text: 'Starta och avsluta ett pass', hint: 'Då loggas det i Statistik och dina mål börjar följa dig.', go: () => navigate(first ? `/pass/aktivt/${first.id}` : '/pass/aktivt/tomt') },
  ]
  const next = steps.findIndex((s) => !s.done)

  return (
    <Card aria-labelledby="start-title">
      <h2 id="start-title" className={styles.title}>KOM IGÅNG</h2>
      <ol className={styles.list}>
        {steps.map((s, i) => (
          <li key={s.text} className={styles.item}>
            <span className={`${styles.badge} ${s.done ? styles.done : ''}`} aria-hidden="true">{s.done ? <Icon name="check" size={14} /> : i + 1}</span>
            <div className={styles.text}>
              <p className={styles.step}>{s.text}</p>
              <p className={styles.hint}>{s.hint}</p>
            </div>
            {i === next && (
              <button type="button" className={styles.go} onClick={s.go} aria-label={`${s.text}: öppna`}>
                <Icon name="arrowRight" size={16} />
              </button>
            )}
          </li>
        ))}
      </ol>
    </Card>
  )
}
