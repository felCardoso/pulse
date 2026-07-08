'use client'

interface Point {
  date: string
  value: number
}

interface Props {
  points: Point[]
  unit?: string
  title?: string
  /** Draws a dashed target line and includes it in the scale */
  goal?: number | null
}

const W = 320
const H = 120
const PAD = 14

// Lightweight SVG line chart — no chart lib needed for a simple trend.
export default function WeightChart({ points, unit = 'kg', title = 'Evolução do peso', goal }: Props) {
  if (points.length === 0) return null

  const values = points.map((p) => p.value)
  if (goal != null) values.push(goal)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const x = (i: number) =>
    points.length === 1 ? W / 2 : PAD + (i * (W - PAD * 2)) / (points.length - 1)
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2)

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ')
  const last = points[points.length - 1]

  const fmtShort = (date: string) => {
    const [, m, d] = date.split('-')
    return `${d}/${m}`
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          mín {Math.min(...points.map((p) => p.value))}{unit} · máx {Math.max(...points.map((p) => p.value))}{unit}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title}>
        {/* Goal line */}
        {goal != null && (
          <>
            <line
              x1={PAD}
              y1={y(goal)}
              x2={W - PAD}
              y2={y(goal)}
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              opacity="0.55"
            />
            <text
              x={W - PAD}
              y={y(goal) - 4}
              textAnchor="end"
              fontSize="9"
              fill="hsl(var(--primary))"
              opacity="0.9"
            >
              meta {goal}{unit}
            </text>
          </>
        )}
        {points.length > 1 && (
          <path
            d={path}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {points.map((p, i) => (
          <circle
            key={p.date + i}
            cx={x(i)}
            cy={y(p.value)}
            r={i === points.length - 1 ? 4.5 : 3}
            fill={i === points.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--card))'}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
        <span>{fmtShort(points[0].date)}</span>
        {points.length > 1 && <span>{fmtShort(last.date)}</span>}
      </div>
    </div>
  )
}
