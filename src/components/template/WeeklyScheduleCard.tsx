'use client'

import { useState } from 'react'
import { X, Check, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePulseStore } from '@/store/pulse-store'

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// Weekly training schedule, editable straight from the workouts hub:
// tap a day to pick which template (or rest) belongs to it.
export default function WeeklyScheduleCard() {
  const templates = usePulseStore((s) => s.templates)
  const weeklySchedule = usePulseStore((s) => s.weeklySchedule)
  const setWeeklySchedule = usePulseStore((s) => s.setWeeklySchedule)
  const [editingDay, setEditingDay] = useState<number | null>(null)

  if (templates.length === 0) return null

  const today = new Date().getDay()

  const templateFor = (day: number) =>
    templates.find((t) => t.id === weeklySchedule[String(day)]) ?? null

  return (
    <div className="space-y-2.5">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" />
        Agenda da semana
      </h2>

      <div className="grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((label, day) => {
          const template = templateFor(day)
          const isToday = day === today
          return (
            <button
              key={day}
              onClick={() => setEditingDay(day)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border px-1 py-2 transition-colors',
                isToday
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-semibold',
                  isToday ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  'w-full truncate text-center text-[9px] leading-tight',
                  template ? 'font-medium text-foreground' : 'text-muted-foreground/50'
                )}
              >
                {template ? template.name : '—'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Day editor sheet */}
      {editingDay !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setEditingDay(null)}
        >
          <div
            className="w-full rounded-t-2xl border-t border-border bg-background p-4 space-y-3 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {DAY_NAMES[editingDay]}
              </h3>
              <button
                onClick={() => setEditingDay(null)}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setWeeklySchedule(editingDay, null)
                  setEditingDay(null)
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-colors',
                  !weeklySchedule[String(editingDay)]
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                <span className="text-sm text-muted-foreground">Descanso</span>
                {!weeklySchedule[String(editingDay)] && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
              {templates.map((t) => {
                const selected = weeklySchedule[String(editingDay)] === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setWeeklySchedule(editingDay, t.id)
                      setEditingDay(null)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-colors',
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/40'
                    )}
                  >
                    <span className="truncate text-sm font-medium text-foreground">
                      {t.name}
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
