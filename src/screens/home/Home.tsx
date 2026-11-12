import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { IconBadge } from '../../components/ui/IconBadge'
import { workoutIcon } from '../../data/workouts'
import { getSuggestion } from '../../store/suggestions'
import { useWorkoutStore } from '../../store/WorkoutStore'
import { useSettings } from '../../store/SettingsStore'
import { readSession } from '../active/session'
import { DevelopmentCard } from './DevelopmentCard'
import { GettingStarted } from './GettingStarted'
import { Greeting } from './Greeting'
import styles from './Home.module.css'

export default function Home() {
  const navigate = useNavigate()
  const { workouts, rotation, history } = useWorkoutStore()
  const { name } = useSettings()
  const suggestion = getSuggestion(workouts, rotation, history)
  // Pågående pass (sparas löpande i Aktivt pass)
  const active = readSession()
  const activeName = active ? (active.id === 'tomt' ? 'Tomt pass' : workouts.find((w) => w.id === active.id)?.name ?? null) : null

  const hero =
    active && activeName
      ? {
          eyebrow: 'PÅGÅENDE PASS',
          title: activeName,
          icon: 'play' as const,
          hint: 'Du har ett pass igång. Fortsätt där du slutade.',
          workoutId: active.id as string | null,
        }
      : suggestion.kind === 'rotation'
      ? {
          eyebrow: 'NÄSTA PASS',
          title: suggestion.workout.name,
          icon: workoutIcon(suggestion.workout),
          hint: `Nästa i din rotation · ${suggestion.index + 1} av ${suggestion.order.length}`,
          workoutId: suggestion.workout.id as string | null,
        }
      : suggestion.kind === 'random'
        ? {
            eyebrow: 'FÖRSLAG',
            title: suggestion.workout.name,
            icon: workoutIcon(suggestion.workout),
            hint: 'Slumpat bland dina sparade pass',
            workoutId: suggestion.workout.id as string | null,
          }
        : {
            eyebrow: 'KOM IGÅNG',
            title: 'Skapa ditt första pass',
            icon: 'plus' as const,
            hint: 'Spara ett pass så föreslår vi nästa gång',
            workoutId: null as string | null,
          }

  return (
    <>
      <header className={styles.header}>
        <Greeting name={name} />
      </header>

      <Card variant="glass" outline="accent-2" className={styles.heroCard} aria-labelledby="next-title">
        <div className={styles.nextHeader}>
          <IconBadge icon={hero.icon} tone="accent-2" />
          <div>
            <p className={styles.nextEyebrow}>{hero.eyebrow}</p>
            <h2 id="next-title" className={styles.nextTitle}>{hero.title}</h2>
          </div>
        </div>
        <p className={styles.nextHint}>{hero.hint}</p>
        <Button
          variant="primary"
          icon={hero.workoutId ? 'play' : 'plus'}
          fullWidth
          onClick={() => navigate(hero.workoutId ? `/pass/aktivt/${hero.workoutId}` : '/pass/ny')}
        >
          {active && activeName ? 'Fortsätt pass' : hero.workoutId ? 'Starta pass' : 'Skapa pass'}
        </Button>
      </Card>

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
