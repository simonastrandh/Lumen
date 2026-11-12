import { useEffect } from 'react'

/**
 * Håller skärmen tänd medan passet pågår, så att timern inte stannar när telefonen låser sig.
 * Använder Screen Wake Lock API (stöds i Safari från iOS 16.4 och i Chrome); saknas stödet händer inget.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const acquire = async () => {
      try {
        const l = await navigator.wakeLock.request('screen')
        if (cancelled) void l.release()
        else lock = l
      } catch {
        /* nekas t.ex. vid låg batterinivå – ignorera */
      }
    }
    void acquire()
    // Låset släpps när fliken döljs; ta det igen när man kommer tillbaka
    const onVisible = () => { if (document.visibilityState === 'visible') void acquire() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [active])
}
