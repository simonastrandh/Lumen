import { isCardio } from '../../data/exercises'
import { estimateMinutes, type Workout } from '../../data/workouts'
import { useSettings } from '../../store/SettingsStore'
import { useWorkoutStore } from '../../store/WorkoutStore'

/** Ungefärlig tid för ett pass, med övningarnas egna viloetider (annars standardvilan i Inställningar). */
export function useWorkoutMinutes() {
  const { getExercise } = useWorkoutStore()
  const { defaultRest } = useSettings()
  return (w: Workout) =>
    estimateMinutes(
      w,
      (id) => isCardio(getExercise(id)),
      (id) => getExercise(id)?.defaults?.rest ?? defaultRest,
    )
}
