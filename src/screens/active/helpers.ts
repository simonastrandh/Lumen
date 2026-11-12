import { fmtDistance, fmtWeight } from '../../data/units'
import { durationLabel } from '../../components/pickers/TimeField'
import type { ExerciseDefaults } from '../../data/exercises'

/** Ett set under passet: planerade värden (kan ändras medan man tränar) + om det är klart */
export type SetState = ExerciseDefaults & { done: boolean }

/** En övning i det pågående passet med sina set */
export interface Item {
  exerciseId: string
  sets: SetState[]
}

/**
 * Den enda timern i skärmen. Ringen visar alltid "det som tickar just nu":
 *  - rest      – vila mellan set (startar av sig själv när ett set bockas av)
 *  - work      – nedräkning för ett set med tid (plankan, löptur på 20 min)
 *  - stopwatch – uppräkning för ett set utan måltid, t.ex. löpning där bara distansen är målet
 */
export type Timer =
  | { kind: 'rest' | 'work'; total: number; endAt: number; ei: number; si: number }
  | { kind: 'stopwatch'; startAt: number; ei: number; si: number }


export const isTimed = (s: SetState) => s.seconds !== undefined || s.minutes !== undefined
export const isDistanceOnly = (s: SetState) => !isTimed(s) && s.km !== undefined && s.reps === 0 && s.kg === undefined

export const setText = (s: SetState) =>
  [
    s.kg !== undefined && fmtWeight(s.kg),
    s.reps !== undefined && s.reps > 0 && `${s.reps} reps`,
    s.seconds !== undefined && durationLabel(s.seconds),
    s.minutes !== undefined && durationLabel(s.minutes * 60),
    s.km !== undefined && fmtDistance(s.km),
  ]
    .filter(Boolean)
    .join(' · ')

/** Nya set för en övning utifrån planerade värden */
export const makeSets = (we: { sets: number; reps: number; kg?: number; seconds?: number; minutes?: number; km?: number }): SetState[] => {
  const base: ExerciseDefaults = { reps: we.reps, kg: we.kg, seconds: we.seconds, minutes: we.minutes, km: we.km }
  return Array.from({ length: Math.max(1, we.sets) }, () => ({ ...base, done: false }))
}
