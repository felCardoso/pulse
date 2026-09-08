'use client'

import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useEchoStore, isWeekday } from '@/store/echo-store'
import { getLocalDateStr } from '@/utils/format'
import type { Habit, HabitFrequency } from '@/types'

interface Props {
  habit: Habit
  onClose: () => void
}

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: 'weekdays', label: 'Dias úteis' },
  { value: 'daily', label: 'Todos os dias' },
]

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function SwitchButton({
  checked,
  onToggle,
  label,
}: {
  checked: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-secondary'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

export default function HabitDetailDialog({ habit, onClose }: Props) {
  const updateHabit = useEchoStore((s) => s.updateHabit)
  const toggleHabitDate = useEchoStore((s) => s.toggleHabitDate)
  const [name, setName] = useState(habit.name)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const commitName = () => {
    const trimmed = name.trim()
    if (trimmed && trimmed !== habit.name) updateHabit(habit.id, { name: trimmed })
    else setName(habit.name)
  }

  const today = getLocalDateStr()
  const createdAtLocal = getLocalDateStr(new Date(habit.createdAt))

  const days = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: { date: string; day: number }[] = []
    for (let i = 0; i < startOffset; i++) cells.push({ date: '', day: 0 })
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: getLocalDateStr(new Date(year, month, d)), day: d })
    }
    return cells
  }, [calendarMonth])

  const monthLabel = calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl space-y-5 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2">
          <Label htmlFor="habit-detail-name">Nome</Label>
          <Input
            id="habit-detail-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            maxLength={60}
          />
        </div>

        <div className="space-y-2">
          <Label>Frequência</Label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateHabit(habit.id, { frequency: opt.value })}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  habit.frequency === opt.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div className="pr-3">
            <p className="text-sm font-medium text-foreground">Rotina eterna</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sem meta de 30 dias — acompanha um progresso mensal contínuo.
            </p>
          </div>
          <SwitchButton
            checked={!!habit.eternal}
            onToggle={() => updateHabit(habit.id, { eternal: !habit.eternal })}
            label="Rotina eterna"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div className="pr-3">
            <p className="text-sm font-medium text-foreground">Mostrar no Início</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Exibe essa rotina no widget de check-in rápido da tela inicial.
            </p>
          </div>
          <SwitchButton
            checked={habit.showOnHome !== false}
            onToggle={() => updateHabit(habit.id, { showOnHome: habit.showOnHome === false })}
            label="Mostrar no Início"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium capitalize text-foreground">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_LABELS.map((w, i) => (
              <span key={i} className="text-[10px] text-muted-foreground">
                {w}
              </span>
            ))}
            {days.map((cell, i) => {
              if (!cell.date) return <div key={`empty-${i}`} />
              const checked = habit.completions.includes(cell.date)
              const countsToward = habit.frequency === 'daily' || isWeekday(cell.date)
              const outOfRange = cell.date > today || cell.date < createdAtLocal || !countsToward
              return (
                <button
                  key={cell.date}
                  type="button"
                  disabled={outOfRange}
                  onClick={() => toggleHabitDate(habit.id, cell.date)}
                  className={cn(
                    'aspect-square rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
                    checked
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-secondary py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>,
    document.body
  )
}
