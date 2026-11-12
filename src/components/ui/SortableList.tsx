import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
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

const SLIDE_MS = 320
const SLIDE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)' // mjuk "ease-out" som bromsar in på slutet

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Radens just nu synliga translateY, inklusive pågående animation. */
const visibleOffset = (el: HTMLElement) => new DOMMatrix(getComputedStyle(el).transform).m42

/** Låt en rad glida från `from` px till sin plats. Avbryter en eventuell pågående glidning. */
function slideFrom(el: HTMLElement, from: number) {
  el.getAnimations().forEach((a) => a.cancel())
  if (reducedMotion() || Math.abs(from) < 0.5) return
  el.animate([{ transform: `translateY(${from}px)` }, { transform: 'translateY(0)' }], {
    duration: SLIDE_MS,
    easing: SLIDE_EASING,
  })
}

/**
 * Lista med omsortering via grepp.
 * - Den dragna raden följer pekaren direkt; de andra glider mjukt på plats (FLIP med Web Animations).
 * - Ordningen sparas (onReorder) först när du släpper, så draget är lätt även om sidan är tung.
 * - Pil upp/ner på greppet fungerar också.
 * Visar bara en vanlig lista när `sortable` är false.
 */
export function SortableList<T>({ items, getId, onReorder, renderItem, sortable, getLabel }: SortableListProps<T>) {
  /** Ordning (id:n) under pågående drag. null = följ `items`. */
  const [dragOrder, setDragOrder] = useState<string[] | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const rows = useRef(new Map<string, HTMLLIElement>())
  /** Layoutposition (offsetTop – påverkas inte av transform) vid förra renderingen */
  const lastTop = useRef(new Map<string, number>())
  const drag = useRef<{ id: string; grabOffset: number; pointerY: number } | null>(null)

  const byId = new Map(items.map((i) => [getId(i), i]))
  const displayed = dragOrder ? dragOrder.flatMap((id) => byId.get(id) ?? []) : items

  const viewportTop = (el: HTMLElement) => (listRef.current?.getBoundingClientRect().top ?? 0) + el.offsetTop

  // Efter varje rendering: låt rader som bytt plats glida från sin gamla position.
  useLayoutEffect(() => {
    rows.current.forEach((el, id) => {
      const top = el.offsetTop
      const prev = lastTop.current.get(id)
      lastTop.current.set(id, top)
      if (drag.current?.id === id) {
        // Dragen rad: håll den under pekaren trots att dess layoutposition ändrats
        el.style.transform = `translateY(${drag.current.pointerY - drag.current.grabOffset - viewportTop(el)}px)`
      } else if (prev !== undefined && Math.abs(prev - top) > 0.5) {
        slideFrom(el, visibleOffset(el) + (prev - top))
      }
    })
  })

  function startDrag(e: PointerEvent<HTMLButtonElement>, id: string) {
    const el = rows.current.get(id)
    if (!el) return
    e.currentTarget.setPointerCapture(e.pointerId)
    el.getAnimations().forEach((a) => a.cancel())
    drag.current = { id, grabOffset: e.clientY - el.getBoundingClientRect().top, pointerY: e.clientY }
    setDragOrder(items.map(getId))
    setDraggingId(id)
  }

  function handlePointerMove(e: PointerEvent, id: string) {
    const d = drag.current
    const el = rows.current.get(id)
    if (!d || d.id !== id || !el || !dragOrder) return
    d.pointerY = e.clientY

    // Raden följer pekaren direkt
    const top = d.pointerY - d.grabOffset // radens översta kant i viewporten
    el.style.transform = `translateY(${top - viewportTop(el)}px)`
    const bottom = top + el.offsetHeight

    // Byt plats när dragna radens framkant passerat en grannes mittpunkt.
    // (Framkant = överkant när du drar uppåt, underkant nedåt – då flimrar det inte
    // även om sektionerna har olika höjd.)
    const from = dragOrder.indexOf(id)
    let to = from
    dragOrder.forEach((otherId, i) => {
      const other = rows.current.get(otherId)
      if (!other || otherId === id) return
      const center = viewportTop(other) + other.offsetHeight / 2
      if (i < from && top < center) to--
      if (i > from && bottom > center) to++
    })
    if (to !== from) {
      const next = [...dragOrder]
      next.splice(to, 0, next.splice(from, 1)[0])
      flushSync(() => setDragOrder(next)) // rendera direkt så att nästa pekarhändelse mäter rätt
    }
  }

  function endDrag(id: string) {
    const d = drag.current
    const el = rows.current.get(id)
    if (!d || d.id !== id) return
    const finalOffset = el ? visibleOffset(el) : 0
    drag.current = null
    if (el) el.style.transform = ''
    if (dragOrder && dragOrder.some((x, i) => x !== items.map(getId)[i])) onReorder(displayed)
    setDragOrder(null)
    setDraggingId(null)
    if (el) slideFrom(el, finalOffset) // glid mjukt ner på platsen
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
      {displayed.map((item, index) => {
        const id = getId(item)
        return (
          <li
            key={id}
            ref={(el) => {
              if (el) rows.current.set(id, el)
              else { rows.current.delete(id); lastTop.current.delete(id) }
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
