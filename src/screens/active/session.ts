import type { Item, Timer } from './helpers'

const KEY = 'styrkeloggen-active-session'

/** Pågående pass, sparat löpande så att det överlever omladdning, flikbyte och att appen stängs. */
export interface ActiveSession {
  /** Passets id, eller "tomt" */
  id: string
  startedAt: number
  ei: number
  items: Item[]
  timer: Timer | null
}

export function readSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ActiveSession) : null
  } catch {
    return null
  }
}

export function writeSession(s: ActiveSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignorera */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignorera */
  }
}
