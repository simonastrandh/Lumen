import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { getDailyMotivation } from '../../data/motivation'
import { workoutsThisMonth } from '../../data/stats'
import { estimateMinutes } from '../../data/workouts'
import { getSuggestion } from '../../store/suggestions'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { readSession } from '../active/session'
import { exerciseCount } from '../workouts/labels'
import { DevelopmentCard } from './DevelopmentCard'
import { GettingStarted } from './GettingStarted'
import styles from './Home.module.css'

/** Hem: en stor siffra (pass denna månad), nästa pass som en gul rad, mål och startguide för nya användare. */
export default function Home() {
  const navigate = useNavigate()
  const { workouts, rotation, history } = useWorkoutStore()
  const suggestion = getSuggestion(workouts, rotation, history)
  // Pågående pass (sparas löpande i Aktivt pass)
  const active = readSession()
  const activeName = active ? (active.id === 'tomt' ? 'Tomt pass' : workouts.find((w) => w.id === active.id)?.name ?? null) : null
  const month = workoutsThisMonth(history)
  const motivation = getDailyMotivation(new Date()).text

  const workoutMeta = (w: { exercises: unknown[] } & Parameters<typeof estimateMinutes>[0]) => `${exerciseCount(w.exercises.length)} · ca ${estimateMinutes(w)} min`

  const hero =
    active && activeName
      ? { label: 'Pågående pass', title: activeName, meta: 'Du har ett pass igång', icon: 'play' as const, workoutId: active.id as string | null, aria: `Fortsätt pass ${activeName}` }
      : suggestion.kind === 'rotation'
        ? { label: 'Nästa pass', title: suggestion.workout.name, meta: `Nästa i din rotation · ${suggestion.index + 1} av ${suggestion.order.length}`, icon: 'play' as const, workoutId: suggestion.workout.id as string | null, aria: `Starta pass ${suggestion.workout.name}` }
        : suggestion.kind === 'random'
          ? { label: 'Nästa pass', title: suggestion.workout.name, meta: workoutMeta(suggestion.workout), icon: 'play' as const, workoutId: suggestion.workout.id as string | null, aria: `Starta pass ${suggestion.workout.name}` }
          : { label: 'Första steget', title: 'Skapa pass', meta: 'Ett pass är en lista övningar', icon: 'plus' as const, workoutId: null as string | null, aria: 'Skapa ditt första pass' }

  return (
    <>

      <section className={styles.big} aria-label="Pass denna månad">
        <p className={styles.bigLabel}>Pass denna månad</p>
        <div className={styles.bigValue}>
          <span className={`${styles.bigNumber} ${month >= 100 ? styles.bigNumberSmall : ''}`}>{month}</span>
          <span className={styles.bigUnit}>PASS</span>
        </div>
        <p className={styles.bigSub}>{motivation}</p>
      </section>

      <button
        type="button"
        className={styles.next}
        aria-label={hero.aria}
        onClick={() => navigate(hero.workoutId ? `/pass/aktivt/${hero.workoutId}` : '/pass/ny')}
      >
        <span className={styles.nextText}>
          <span className={styles.nextLabel}>{hero.label}</span>
          <span className={styles.nextTitle}>{hero.title}</span>
          <span className={styles.nextMeta}>{hero.meta}</span>
        </span>
        <span className={styles.play} aria-hidden="true">
          <Icon name={hero.icon} size={22} />
        </span>
      </button>

      {!(active && activeName) && (
        <Button variant="secondary" icon="plus" fullWidth onClick={() => navigate('/pass/aktivt/tomt')} className={styles.emptyWorkout}>
          Starta tomt pass
        </Button>
      )}

      <GettingStarted />

      <DevelopmentCard />
    </>
  )
}
