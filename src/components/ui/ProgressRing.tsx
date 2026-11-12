import type { ReactNode } from 'react'

interface ProgressRingProps {
  /** 0–100 */
  value: number
  size?: number
  strokeWidth?: number
  children?: ReactNode
  label?: string
  /** Färg på bågen */
  tone?: 'accent' | 'accent-2'
  /** Jämn, linjär rörelse mellan uppdateringar (för timers som tickar flera gånger i sekunden) */
  smooth?: boolean
}

export function ProgressRing({ value, size = 72, strokeWidth = 6, children, label, tone = 'accent', smooth }: ProgressRingProps) {
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
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 6px ${tone === 'accent' ? 'var(--accent-glow)' : 'color-mix(in srgb, var(--accent-2) 45%, transparent)'})`, transition: 'filter 0.3s ease' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`var(--${tone})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={smooth ? { transition: 'stroke-dashoffset 0.26s linear' } : undefined}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16 }}>
        {children ?? `${Math.round(clamped)}%`}
      </div>
    </div>
  )
}
