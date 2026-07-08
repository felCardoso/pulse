'use client'

interface Point {
  date: string
  value: number
}

interface Props {
  points: Point[]
  unit?: string
}

const W = 320
const H = 120
const PAD = 14

// Lightweight SVG line chart — no chart lib needed for a simple trend.
export default function WeightChart({ points, unit = 'kg' }: Props) {
  if (points.length === 0) return null

  const values = points.map((p) => p.value)
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
        <p className="text-sm text-muted-foreground">Evolução do peso</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          mín {min}{unit} · máx {max}{unit}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfico de peso">
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
