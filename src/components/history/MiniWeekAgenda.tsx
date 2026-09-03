'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEchoStore } from '@/store/echo-store'
import { getLocalDateStr } from '@/utils/format'

const DAY_LETTERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

/** Compact read-only preview of the weekly training schedule — tap to
 * jump into /treinos, where the full "Agenda da semana" card lets you
 * assign a workout (or rest) to each day. */
export default function MiniWeekAgenda() {
  const templates = useEchoStore((s) => s.templates)
  const weeklySchedule = useEchoStore((s) => s.weeklySchedule)
  const sessions = useEchoStore((s) => s.sessions)
  const today = new Date().getDay()

  const trainedToday = sessions.some(
    (s) => s.status === 'completed' && getLocalDateStr(new Date(s.startedAt)) === getLocalDateStr()
  )

  return (
    <Link
      href="/treinos"
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Agenda da semana</p>
        <span className="text-xs font-medium text-primary">Editar</span>
      </div>
      <div className="flex justify-between gap-1">
        {DAY_LETTERS.map((letter, day) => {
          const hasWorkout = templates.some((t) => t.id === weeklySchedule[String(day)])
          const isToday = day === today
          const isDoneToday = isToday && trainedToday
          return (
            <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                  isDoneToday
                    ? 'bg-primary text-primary-foreground'
                    : hasWorkout
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground',
                  isToday && !isDoneToday && 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                )}
              >
                {isDoneToday ? <Check className="h-4 w-4" /> : letter}
              </div>
            </div>
          )
        })}
      </div>
    </Link>
  )
}
