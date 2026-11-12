import { useEffect, useState } from 'react'

/** Som useState, men sparas i localStorage så att värdet överlever omladdning. */
export function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw) as T
    } catch {
      /* blockerat eller trasigt – använd startvärdet */
    }
    return initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignorera */
    }
  }, [key, value])

  return [value, setValue] as const
}
