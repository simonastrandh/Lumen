import type { SVGProps } from 'react'

/**
 * Egna linjeikoner (24×24, tunn kontur, rundade ändar) i samma anda som
 * activetheory.net: minimalistiska, geometriska och med glöd när de är aktiva.
 * Lägg till en ny ikon genom att lägga till en rad i `paths`.
 */
const paths = {
  home: 'M4 11.2 12 4l8 7.2V19a1.5 1.5 0 0 1-1.5 1.5H15V15h-6v5.5H5.5A1.5 1.5 0 0 1 4 19z',
  workout: 'M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11',
  stats: 'M4 4.5V19.5H20M8 15.5l3.5-4.5 3 2.5L19.5 7',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  plus: 'M12 5v14M5 12h14',
  play: 'M8 5.5v13L19 12z',
  trendUp: 'M4.5 17 10 11.5l3.5 3.5 6-7M14.5 8h5v5',
  check: 'M5 12.5 10 17.5 19 7',
  minus: 'M6 12h12',
  grip: 'M5 8h14M5 12h14M5 16h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  layers: 'M12 3.5 3.5 8l8.5 4.5L20.5 8zM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5',
  repeat: 'M17 2.5 20.5 6 17 9.5M3.5 11.5V10a4 4 0 0 1 4-4h13M7 21.5 3.5 18 7 14.5M20.5 12.5V14a4 4 0 0 1-4 4h-13',
  chevronRight: 'M9 5l7 7-7 7',
  chevronLeft: 'M15 5l-7 7 7 7',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  trash: 'M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5',
  close: 'M6 6l12 12M18 6 6 18',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5A3 3 0 0 1 16 10.5M12 13v4M8.5 20h7M10 17h4',
  bolt: 'M13 3 5.5 13h5.5l-1 8L18.5 11H13z',
} as const

export type IconName = keyof typeof paths

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
  /** Lägger turkos glöd runt ikonen (aktiva/viktiga tillstånd) */
  glow?: boolean
}

export function Icon({ name, size = 22, glow, style, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, ...(glow ? { filter: 'drop-shadow(0 0 5px var(--accent-glow))' } : null), ...style }}
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  )
}
