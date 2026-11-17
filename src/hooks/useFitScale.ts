import { useLayoutEffect, useRef } from 'react'

/**
 * Krymper en rad med stor text så att den får plats på bredden, oavsett innehåll.
 * Raden får CSS-variabeln `--fit` (1 = full storlek) som textstorlekarna multipliceras med.
 */
export function useFitScale<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      el.style.setProperty('--fit', '1')
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      const kids = Array.from(el.children) as HTMLElement[]
      const need = kids.reduce((w, k) => w + k.getBoundingClientRect().width, 0) + gap * Math.max(0, kids.length - 1)
      const avail = el.clientWidth
      el.style.setProperty('--fit', need > avail && need > 0 ? String(Math.floor((avail / need) * 100) / 100) : '1')
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [dep])

  return ref
}
