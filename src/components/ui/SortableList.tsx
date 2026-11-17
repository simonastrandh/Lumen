import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { Icon } from './Icon'
import styles from './SortableList.module.css'

interface SortableListProps<T> {
  items: T[]
  getId: (item: T) => string
  onReorder: (items: T[]) => void
  renderItem: (item: T) => ReactNode
  /** Visa grepp och tillåt omsortering (redigeringsläge) */
  sortable: boolean
  /** Används i grepparnas aria-label, t.ex. "Flytta Mål" */
  getLabel?: (item: T) => string
}

const SETTLE_MS = 180
const SHIFT = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface DragState {
  id: string
  from: number
  to: number
  grabOffset: number
  /** Radernas höjd och översta kant (relativt listan) när draget började, i ursprunglig ordning */
  ids: string[]
  heights: number[]
  tops: number[]
  listTop: number
  startY: number
}

/**
 * Lista med omsortering via grepp.
 * - Under draget ändras inget i React och DOM-ordningen ligger fast: den dragna raden följer pekaren
 *   med en ren transform och grannarna glider undan med CSS-transition. Därför blir det mjukt.
 * - Ordningen sparas (onReorder) först när du släpper, efter att raden glidit ner på sin plats.
 * - Pil upp/ner på greppet fungerar också.
 * Visar bara en vanlig lista när `sortable` är false.
 */
export function SortableList<T>({ items, getId, onReorder, renderItem, sortable, getLabel }: SortableListProps<T>) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const rows = useRef(new Map<string, HTMLLIElement>())
  const drag = useRef<DragState | null>(null)

  /** Ny ordning (ursprungliga index) om raden läggs på plats `to` */
  const orderFor = (d: DragState, to: number) => {
    const order = d.ids.map((_, i) => i).filter((i) => i !== d.from)
    order.splice(to, 0, d.from)
    return order
  }

  /** Lägg ut raderna enligt `to`: grannarna glider, den dragna raden lämnas åt pekaren. */
  function layout(d: DragState) {
    let y = 0
    orderFor(d, d.to).forEach((orig) => {
      const el = rows.current.get(d.ids[orig])
      if (el && orig !== d.from) {
        el.style.transition = SHIFT
        el.style.transform = `translateY(${y - (d.tops[orig] - d.tops[0])}px)`
      }
      y += d.heights[orig]
    })
  }

  function startDrag(e: PointerEvent<HTMLButtonElement>, id: string) {
    const list = listRef.current
    if (!list) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const ids = items.map(getId)
    const els = ids.map((i) => rows.current.get(i)!)
    const rects = els.map((el) => el.getBoundingClientRect())
    const from = ids.indexOf(id)
    drag.current = {
      id,
      from,
      to: from,
      grabOffset: e.clientY - rects[from].top,
      ids,
      heights: rects.map((r) => r.height),
      tops: rects.map((r) => r.top),
      listTop: rects[0].top,
      startY: rects[from].top,
    }
    els.forEach((el) => el.getAnimations().forEach((a) => a.cancel()))
    setDraggingId(id)
  }

  function handlePointerMove(e: PointerEvent, id: string) {
    const d = drag.current
    const el = rows.current.get(id)
    if (!d || d.id !== id || !el) return
    // Dragna raden följer pekaren direkt (ingen transition)
    const top = e.clientY - d.grabOffset
    el.style.transition = 'none'
    el.style.transform = `translateY(${top - d.startY}px)`

    // Var hamnar mitten av den dragna raden bland de andra? (relativt listans överkant)
    const center = top + d.heights[d.from] / 2 - d.listTop
    let to = 0
    let y = 0
    d.ids.forEach((_, i) => {
      if (i === d.from) return
      if (center > y + d.heights[i] / 2) to++
      y += d.heights[i]
    })
    if (to !== d.to) {
      d.to = to
      layout(d)
    }
  }

  function endDrag(id: string) {
    const d = drag.current
    const el = rows.current.get(id)
    if (!d || d.id !== id) return
    drag.current = null
    const order = orderFor(d, d.to)
    const commit = () => {
      // Rensa transformer och spara ordningen; DOM-ordningen följer då med
      rows.current.forEach((r) => {
        r.style.transition = ''
        r.style.transform = ''
      })
      setDraggingId(null)
      if (d.to !== d.from) {
        const next = order.map((i) => items[i])
        onReorder(next)
      }
    }
    if (!el || reducedMotion()) return commit()
    // Glid den dragna raden ner på sin plats innan vi sparar
    let y = 0
    for (const orig of order) {
      if (orig === d.from) break
      y += d.heights[orig]
    }
    const target = y - (d.startY - d.listTop)
    const anim = el.animate([{ transform: el.style.transform || 'none' }, { transform: `translateY(${target}px)` }], { duration: SETTLE_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' })
    anim.onfinish = () => {
      anim.cancel()
      commit()
    }
  }

  function handleKeyDown(e: KeyboardEvent, index: number) {
    const to = e.key === 'ArrowUp' ? index - 1 : e.key === 'ArrowDown' ? index + 1 : index
    if (to === index || to < 0 || to >= items.length) return
    e.preventDefault()
    const next = [...items]
    next.splice(to, 0, next.splice(index, 1)[0])
    onReorder(next)
  }

  return (
    <ul ref={listRef} className={styles.list}>
      {items.map((item, index) => {
        const id = getId(item)
        return (
          <li
            key={id}
            ref={(el) => {
              if (el) rows.current.set(id, el)
              else rows.current.delete(id)
            }}
            className={`${styles.row} ${draggingId === id ? styles.dragging : ''}`}
          >
            {sortable && (
              <button
                type="button"
                className={styles.handle}
                aria-label={`Flytta ${getLabel?.(item) ?? 'rad'} (dra eller använd piltangenter)`}
                onPointerDown={(e) => startDrag(e, id)}
                onPointerMove={(e) => handlePointerMove(e, id)}
                onPointerUp={() => endDrag(id)}
                onPointerCancel={() => endDrag(id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <Icon name="grip" size={20} />
              </button>
            )}
            <div className={styles.content}>{renderItem(item)}</div>
          </li>
        )
      })}
    </ul>
  )
}
