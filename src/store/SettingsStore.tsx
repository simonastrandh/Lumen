import { Fragment, createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { setUnitSystem, type UnitSystem } from '../data/units'

interface Settings {
  /** Vilotid i sekunder för övningar som inte har en egen vilotid */
  defaultRest: number
  setDefaultRest: (seconds: number) => void
  /** Mörkt (standard) eller ljust utseende */
  theme: Theme
  setTheme: (t: Theme) => void
  /** Metriskt (kg, km) eller amerikanskt (lb, miles). Sparad data är alltid i kg/km. */
  units: UnitSystem
  setUnits: (u: UnitSystem) => void
}

export type Theme = 'dark' | 'light'

const Ctx = createContext<Settings | null>(null)

/** Appens inställningar, sparas lokalt. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [defaultRest, setDefaultRest] = useLocalStorageState<number>('styrkeloggen-default-rest', 90)
  const [theme, setTheme] = useLocalStorageState<Theme>('styrkeloggen-theme', 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  const [units, setUnits] = useLocalStorageState<UnitSystem>('styrkeloggen-units', 'metric')
  setUnitSystem(units) // före första renderingen av barnen, så att alla texter får rätt enhet
  const value = useMemo(() => ({ defaultRest, setDefaultRest, theme, setTheme, units, setUnits }), [defaultRest, setDefaultRest, theme, setTheme, units, setUnits])
  // key: byter man enhet byggs vyn om så att varje vikt och distans visas i den nya enheten
  return <Ctx.Provider value={value}><Fragment key={units}>{children}</Fragment></Ctx.Provider>
}

export function useSettings(): Settings {
  const s = useContext(Ctx)
  if (!s) throw new Error('useSettings måste användas inuti <SettingsProvider>')
  return s
}
