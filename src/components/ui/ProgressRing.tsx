import type { ReactNode } from 'react'

interface ProgressRingProps {
  /** 0–100 */
  value: number
  size?: number
  strokeWidth?: number
  children?: ReactNode
  label?: string
  /** Jämn, linjär rörelse mellan uppdateringar (för timers som tickar flera gånger i sekunden) */
  smooth?: boolean
}

export function ProgressRing({ value, size = 72, strokeWidth = 9, children, label, smooth }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent-ink)"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={smooth ? { transition: 'stroke-dashoffset 0.26s linear' } : undefined}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 16 }}>
        {children ?? `${Math.round(clamped)}%`}
      </div>
    </div>
  )
}
