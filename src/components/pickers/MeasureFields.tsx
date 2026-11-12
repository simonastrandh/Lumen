import { partsOf, type CardioMeasure, ExerciseDefaults, ExerciseKind, StrengthMeasure } from '../../data/exercises'
import { durationLabel } from './TimeField'
import { WheelField, range } from './WheelPicker'
import { displayToKg, displayToKm, distanceUnit, fmtDistance, fmtWeight, getUnitSystem, kgToDisplay, kmToDisplay, nearest, weightUnit } from '../../data/units'
import styles from './MeasureFields.module.css'

export interface MeasureShow { rest?: boolean; sets?: boolean; reps?: boolean; kg?: boolean; seconds?: boolean; minutes?: boolean; km?: boolean }

/** Vilka värden som ska anges utifrån hur övningen mäts */
export function showFor(kind: ExerciseKind | undefined, measure?: CardioMeasure, strength?: StrengthMeasure): MeasureShow {
  if (kind === 'kondition') {
    const m = measure ?? 'tid'
    return { minutes: m !== 'distans', km: m !== 'tid' }
  }
  const s = strength ?? 'reps'
  const p = partsOf(s)
  return { sets: true, rest: true, reps: p.includes('reps'), kg: p.includes('vikt'), seconds: p.includes('tid') }
}

/** Viktsteg: 0,5 kg upp till 60 kg, därefter 2,5 kg upp till 500 (färre rader att scrolla) */
const kgValues = [...range(1, 60, 0.5), ...range(62.5, 500, 2.5)]
/** Samma idé i pund: 0,5 lb upp till 50 lb, därefter 2,5 lb upp till 1100 */
const lbValues = [...range(1, 50, 0.5), ...range(52.5, 1100, 2.5)]
const kmValues = range(0.5, 200, 0.5)
const miValues = range(0.25, 125, 0.25)

/** Standardvikt när inget är valt: 20 kg, eller en jämn 45 lb i amerikanska enheter */
const defaultKg = () => (getUnitSystem() === 'imperial' ? displayToKg(45) : fallback.kg)
export const fallback = { rest: 90, sets: 3, reps: 10, kg: 20, seconds: 30, minutes: 20, km: 3 }
const comma = (n: number) => String(n).replace('.', ',')

/** Tid som tre hjul: timmar, minuter och sekunder (som iPhones timer) */
export function TimeWheel({ title, seconds, onChange, display }: { title: string; seconds: number; onChange: (totalSeconds: number) => void; display?: string }) {
  const h = Math.floor(seconds / 3600)
  const min = Math.floor((seconds % 3600) / 60)
  const sec = seconds % 60
  const set = (hh: number, m: number, s: number) => onChange(Math.max(1, hh * 3600 + m * 60 + s)) // minst 1 sekund
  const two = (v: number) => String(v).padStart(2, '0')
  return (
    <WheelField
      title={title}
      display={display ?? durationLabel(seconds)}
      columns={[
        { values: range(0, 23), value: h, onChange: (v) => set(v, min, sec), unit: 'tim' },
        { values: range(0, 59), value: min, onChange: (v) => set(h, v, sec), unit: 'min', format: two },
        { values: range(0, 59), value: sec, onChange: (v) => set(h, min, v), unit: 'sek', format: two },
      ]}
    />
  )
}

interface MeasureFieldsProps {
  show: MeasureShow
  values: ExerciseDefaults
  onChange: (patch: ExerciseDefaults) => void
}

/** Hjulfält för set, reps, vikt, tid och distans. Alla rutor har samma storlek. Används i pass, övningar och nya övningar. */
export function MeasureFields({ show, values: v, onChange }: MeasureFieldsProps) {
  return (
    <div className={styles.grid}>
      {show.sets && <WheelField title="Antal set" display={`${v.sets ?? fallback.sets} set`} columns={[{ values: range(1, 12), value: v.sets ?? fallback.sets, onChange: (sets) => onChange({ sets }), unit: 'set' }]} />}
      {show.reps && <WheelField title="Antal reps" display={`${v.reps ?? fallback.reps} reps`} columns={[{ values: range(1, 100), value: v.reps ?? fallback.reps, onChange: (reps) => onChange({ reps }), unit: 'reps' }]} />}
      {show.kg && <WheelField title="Vikt" display={fmtWeight((v.kg ?? defaultKg()))} columns={[{ values: getUnitSystem() === 'imperial' ? lbValues : kgValues, value: nearest(getUnitSystem() === 'imperial' ? lbValues : kgValues, kgToDisplay((v.kg ?? defaultKg()))), onChange: (x) => onChange({ kg: displayToKg(x) }), unit: weightUnit(), format: comma }]} />}
      {show.rest && <TimeWheel title="Vila mellan set" display={`Vila ${durationLabel(v.rest ?? fallback.rest)}`} seconds={v.rest ?? fallback.rest} onChange={(rest) => onChange({ rest })} />}
      {show.seconds && <TimeWheel title="Tid per set" seconds={v.seconds ?? fallback.seconds} onChange={(seconds) => onChange({ seconds })} />}
      {show.minutes && <TimeWheel title="Tid" seconds={Math.round((v.minutes ?? fallback.minutes) * 60)} onChange={(t) => onChange({ minutes: Math.round((t / 60) * 100) / 100 })} />}
      {show.km && <WheelField title="Distans" display={fmtDistance(v.km ?? fallback.km)} columns={[{ values: getUnitSystem() === 'imperial' ? miValues : kmValues, value: nearest(getUnitSystem() === 'imperial' ? miValues : kmValues, kmToDisplay(v.km ?? fallback.km)), onChange: (x) => onChange({ km: displayToKm(x) }), unit: distanceUnit(), format: comma }]} />}
    </div>
  )
}
