'use client'

import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEchoStore, isWeekday } from '@/store/echo-store'
import { getLocalDateStr } from '@/utils/format'

/** Up to 3 one-tap check-in buttons for today's routines, side by side —
 * lets you mark a habit without leaving Início. The rest live on /rotinas. */
export default function TodayHabitsRow() {
  const habits = useEchoStore((s) => s.habits)
  const toggleHabitToday = useEchoStore((s) => s.toggleHabitToday)
  const getHabitProgress = useEchoStore((s) => s.getHabitProgress)

  const visibleHabits = habits.filter((h) => h.showOnHome !== false)
  if (visibleHabits.length === 0) return null

  const today = getLocalDateStr()
  const shown = visibleHabits.slice(0, 3)

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Rotinas de hoje
        </h2>
        {visibleHabits.length > 3 && (
          <Link
            href="/rotinas"
            className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
          >
            Ver todas
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="flex gap-2">
        {shown.map((habit) => {
          const { checkedToday } = getHabitProgress(habit.id)
          const canCheck = habit.frequency === 'daily' || isWeekday(today)
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabitToday(habit.id)}
              disabled={!canCheck}
              className={cn(
                'flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                checkedToday
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  checkedToday
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                <Check className="h-4 w-4" />
              </div>
              <span className="line-clamp-1 w-full text-[11px] font-medium text-foreground">
                {habit.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
