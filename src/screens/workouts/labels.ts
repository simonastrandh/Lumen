import { fmtDistance, fmtWeight } from '../../data/units'
import { durationLabel } from '../../components/pickers/TimeField'
import { isCardio, type Exercise, type ExerciseDefaults } from '../../data/exercises'
import { estimateMinutes, type Workout, type WorkoutExercise } from '../../data/workouts'

export const exerciseCount = (n: number) => `${n} ${n === 1 ? 'övning' : 'övningar'}`
export const workoutMeta = (w: Workout) => `${w.kind === 'kondition' ? 'Kondition' : 'Styrka'} · ${exerciseCount(w.exercises.length)} · ~${estimateMinutes(w)} min`


/** Kort beskrivning av en övnings mål i ett pass, t.ex. "4 × 8 · 60 kg" eller "20 min · 3 km" */
export function targetText(we: WorkoutExercise, ex?: Exercise): string {
  if (isCardio(ex)) {
    return [we.minutes && durationLabel(we.minutes * 60), we.km && fmtDistance(we.km)].filter(Boolean).join(' · ')
  }
  return [we.reps > 0 ? `${we.sets} × ${we.reps}` : `${we.sets} set`, we.kg && fmtWeight(we.kg), we.seconds && durationLabel(we.seconds)].filter(Boolean).join(' · ')
}

/**
 * Alla mätvärden för ett set som en mening:
 *  kondition: "3 km på 20 min", styrka: "8 reps med 20 kg", "30 s med 20 kg"
 */
export function describeValues(v: ExerciseDefaults): string {
  const time = v.minutes !== undefined ? durationLabel(v.minutes * 60) : undefined
  const km = v.km !== undefined ? fmtDistance(v.km) : undefined
  if (km || time) {
    return [km, time].filter(Boolean).join(' på ')
  }
  const reps = v.reps !== undefined && v.reps > 0 ? `${v.reps} reps` : undefined
  const sec = v.seconds !== undefined ? durationLabel(v.seconds) : undefined
  const main = [reps, sec].filter(Boolean).join(' på ')
  const kg = v.kg !== undefined ? fmtWeight(v.kg) : undefined
  return [main, kg].filter(Boolean).join(' med ')
}

/** Alla set i en övning: "4 set × 8 reps med 20 kg" om de är lika, annars varje set för sig */
export function describeSets(sets: ExerciseDefaults[]): string {
  if (sets.length === 0) return ''
  const texts = sets.map(describeValues)
  if (texts.every((t) => t === texts[0])) return sets.length > 1 ? `${sets.length} set × ${texts[0]}` : texts[0]
  return texts.join(' · ')
}
