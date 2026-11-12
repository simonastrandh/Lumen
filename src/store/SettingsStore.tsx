import { Fragment, createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { setUnitSystem, type UnitSystem } from '../data/units'

interface Settings {
  /** Namn i hälsningen på Hem. Tomt = hälsning utan namn. */
  name: string
  setName: (name: string) => void
  /** Vilotid i sekunder för övningar som inte har en egen vilotid */
  defaultRest: number
  setDefaultRest: (seconds: number) => void
  /** Animerad bakgrund (svävning, ljus och partiklar). Av = stillbild. */
  animated: boolean
  setAnimated: (on: boolean) => void
  /** Metriskt (kg, km) eller amerikanskt (lb, miles). Sparad data är alltid i kg/km. */
  units: UnitSystem
  setUnits: (u: UnitSystem) => void
}

const Ctx = createContext<Settings | null>(null)

/** Appens inställningar, sparas lokalt. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useLocalStorageState<string>('styrkeloggen-name', '')
  const [defaultRest, setDefaultRest] = useLocalStorageState<number>('styrkeloggen-default-rest', 90)
  const [animated, setAnimated] = useLocalStorageState<boolean>('styrkeloggen-animated', true)
  const [units, setUnits] = useLocalStorageState<UnitSystem>('styrkeloggen-units', 'metric')
  setUnitSystem(units) // före första renderingen av barnen, så att alla texter får rätt enhet
  const value = useMemo(() => ({ name, setName, defaultRest, setDefaultRest, animated, setAnimated, units, setUnits }), [name, setName, defaultRest, setDefaultRest, animated, setAnimated, units, setUnits])
  // key: byter man enhet byggs vyn om så att varje vikt och distans visas i den nya enheten
  return <Ctx.Provider value={value}><Fragment key={units}>{children}</Fragment></Ctx.Provider>
}

export function useSettings(): Settings {
  const s = useContext(Ctx)
  if (!s) throw new Error('useSettings måste användas inuti <SettingsProvider>')
  return s
}
