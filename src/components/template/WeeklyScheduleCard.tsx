'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePulseStore } from '@/store/pulse-store'

const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

// Weekly training schedule: one stacked card per day of the week, tap to
// open a modal and assign a saved workout (or rest) to that day.
export default function WeeklyScheduleCard() {
  const templates = usePulseStore((s) => s.templates)
  const weeklySchedule = usePulseStore((s) => s.weeklySchedule)
  const setWeeklySchedule = usePulseStore((s) => s.setWeeklySchedule)
  const [editingDay, setEditingDay] = useState<number | null>(null)

  const today = new Date().getDay()

  const templateFor = (day: number) =>
    templates.find((t) => t.id === weeklySchedule[String(day)]) ?? null

  return (
    <div className="space-y-2">
      {DAY_NAMES.map((name, day) => {
        const template = templateFor(day)
        const isToday = day === today
        return (
          <button
            key={day}
            onClick={() => setEditingDay(day)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors',
              isToday ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/40'
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              {name}
              {isToday && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                  HOJE
                </span>
              )}
            </span>
            <span
              className={cn(
                'shrink-0 truncate rounded-full px-3 py-1 text-xs font-medium',
                template ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
              )}
            >
              {template ? template.name : 'Descanso'}
            </span>
          </button>
        )
      })}

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
              {templates.length === 0 ? (
                <p className="px-1 py-2 text-center text-xs text-muted-foreground">
                  Crie um treino para poder atribuí-lo a este dia.
                </p>
              ) : (
                templates.map((t) => {
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
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
