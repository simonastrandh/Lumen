interface ChartPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: ChartPoint[]
  width?: number
  height?: number
}

const PAD_X = 10
const PAD_TOP = 8
const LABEL_AREA = 24

/** Linjegraf i SVG. Sista punkten markeras med glöd. */
export function LineChart({ data, width = 295, height = 90 }: LineChartProps) {
  if (data.length === 0) return null

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const plotH = height - PAD_TOP - LABEL_AREA
  const stepX = data.length > 1 ? (width - PAD_X * 2) / (data.length - 1) : 0

  const pts = data.map((d, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_TOP + plotH * (1 - (d.value - min) / range),
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const last = pts[pts.length - 1]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={`Linjegraf: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const isLast = i === pts.length - 1
        return (
          <g key={data[i].label}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isLast ? 5 : 3.5}
              fill="var(--accent)"
              style={isLast ? { filter: 'drop-shadow(0 0 6px var(--accent-glow))' } : undefined}
            />
            <text
              x={p.x}
              y={height - 4}
              textAnchor={i === 0 ? 'start' : isLast ? 'end' : 'middle'}
              fontSize={10}
              fill="var(--text-secondary)"
            >
              {data[i].label}
            </text>
          </g>
        )
      })}
      <circle cx={last.x} cy={last.y} r={9} fill="none" stroke="var(--accent)" strokeOpacity={0.3} />
    </svg>
  )
}
