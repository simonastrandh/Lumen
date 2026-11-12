// Enheter: allt sparas alltid i kg och km. Bara visning och inmatning räknas om till lb och miles.

export type UnitSystem = 'metric' | 'imperial'

const LB_PER_KG = 2.20462262
const MI_PER_KM = 0.621371192

let system: UnitSystem = 'metric'
/** Sätts av SettingsProvider så att alla texter och hjul följer valet */
export const setUnitSystem = (s: UnitSystem) => {
  system = s
}
export const getUnitSystem = () => system

const imperial = () => system === 'imperial'
const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d

export const weightUnit = () => (imperial() ? 'lb' : 'kg')
export const distanceUnit = () => (imperial() ? 'mi' : 'km')

export const kgToDisplay = (kg: number) => (imperial() ? round(kg * LB_PER_KG, 1) : kg)
export const displayToKg = (v: number) => (imperial() ? v / LB_PER_KG : v)
export const kmToDisplay = (km: number) => (imperial() ? round(km * MI_PER_KM, 2) : km)
export const displayToKm = (v: number) => (imperial() ? v / MI_PER_KM : v)

/** Räknar om ett lagrat mått ('kg' | 'km' | annat) till visningsenhet och tillbaka */
export const toDisplay = (unit: string, v: number) => (unit === 'kg' ? kgToDisplay(v) : unit === 'km' ? kmToDisplay(v) : v)
export const fromDisplay = (unit: string, v: number) => (unit === 'kg' ? displayToKg(v) : unit === 'km' ? displayToKm(v) : v)
/** Enhetens namn för ett mått, t.ex. 'kg' → 'lb' */
export const unitLabel = (unit: string) => (unit === 'kg' ? weightUnit() : unit === 'km' ? distanceUnit() : unit)

const num = (n: number, d = 2) => String(round(n, d)).replace('.', ',')
/** "20 kg" eller "44,1 lb" */
export const fmtWeight = (kg: number) => `${num(kgToDisplay(kg), 1)} ${weightUnit()}`
/** "3 km" eller "1,86 mi" */
export const fmtDistance = (km: number) => `${num(kmToDisplay(km))} ${distanceUnit()}`
/** Siffran för ett lagrat mått utan enhet */
export const fmtValue = (unit: string, v: number) => num(toDisplay(unit, v), 2)

/** Närmaste värde i en lista (hjul visar bara fasta steg) */
export const nearest = (values: number[], v: number) => values.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), values[0])
