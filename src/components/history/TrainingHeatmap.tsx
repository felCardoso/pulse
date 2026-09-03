'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { WorkoutSession } from '@/types'

const WEEKS = 52
const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

interface DayCell {
  date: string
  count: number
  inFuture: boolean
}

/** GitHub-style contribution grid: one column per week, Sun-Sat top to bottom. */
export default function TrainingHeatmap({ sessions }: { sessions: WorkoutSession[] }) {
  const { weeks, monthMarkers } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of sessions) {
      if (s.status !== 'completed') continue
      const day = s.startedAt.split('T')[0]
      counts.set(day, (counts.get(day) ?? 0) + 1)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Start on the Sunday of the week 51 weeks ago, so the grid ends this week.
    const start = new Date(today)
    start.setDate(start.getDate() - start.getDay() - (WEEKS - 1) * 7)

    const weeks: DayCell[][] = []
    const monthMarkers: { weekIndex: number; label: string }[] = []
    let lastMonth = -1
    const cursor = new Date(start)

    for (let w = 0; w < WEEKS; w++) {
      const column: DayCell[] = []
      for (let d = 0; d < 7; d++) {
        const iso = cursor.toISOString().split('T')[0]
        column.push({ date: iso, count: counts.get(iso) ?? 0, inFuture: cursor > today })
        if (d === 0 && cursor.getMonth() !== lastMonth) {
          lastMonth = cursor.getMonth()
          monthMarkers.push({ weekIndex: w, label: MONTH_LABELS[lastMonth] })
        }
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(column)
    }

    return { weeks, monthMarkers }
  }, [sessions])

  const levelClass = (count: number) => {
    if (count <= 0) return 'bg-secondary'
    if (count === 1) return 'bg-primary/50'
    return 'bg-primary'
  }

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">Frequência de treinos</p>
      <div className="overflow-x-auto no-scrollbar">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="relative mb-1 h-3" style={{ width: WEEKS * 13 }}>
            {monthMarkers.map((m) => (
              <span
                key={`${m.label}-${m.weekIndex}`}
                className="absolute text-[9px] text-muted-foreground"
                style={{ left: m.weekIndex * 13 }}
              >
                {m.label}
              </span>
            ))}
          </div>
          {/* Grid: 52 columns × 7 rows */}
          <div className="flex gap-[3px]">
            {weeks.map((column, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {column.map((cell) => (
                  <div
                    key={cell.date}
                    title={cell.inFuture ? undefined : `${cell.date}${cell.count > 0 ? ` · ${cell.count} treino${cell.count !== 1 ? 's' : ''}` : ''}`}
                    className={cn(
                      'h-[10px] w-[10px] rounded-[2px]',
                      cell.inFuture ? 'bg-transparent' : levelClass(cell.count)
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {sessions.filter((s) => s.status === 'completed').length} treinos no último ano — não quebre a sequência
      </p>
    </div>
  )
}
