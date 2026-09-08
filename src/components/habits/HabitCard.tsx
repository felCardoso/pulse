'use client'

import { useState } from 'react'
import { Check, Trash2, PartyPopper, Flame, Pencil } from 'lucide-react'
import { useEchoStore, isWeekday } from '@/store/echo-store'
import ContextMenu from '@/components/ui/context-menu'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import HabitDetailDialog from '@/components/habits/HabitDetailDialog'
import { getLocalDateStr } from '@/utils/format'
import type { Habit } from '@/types'

interface Props {
  habit: Habit
}

export default function HabitCard({ habit }: Props) {
  const toggleHabitToday = useEchoStore((s) => s.toggleHabitToday)
  const deleteHabit = useEchoStore((s) => s.deleteHabit)
  const getHabitProgress = useEchoStore((s) => s.getHabitProgress)
  const getHabitStreak = useEchoStore((s) => s.getHabitStreak)
  const getHabitMonthProgress = useEchoStore((s) => s.getHabitMonthProgress)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const { count, target, percentage, isRoutine, checkedToday } = getHabitProgress(habit.id)
  const monthProgress = habit.eternal ? getHabitMonthProgress(habit.id) : null
  const barPercentage = monthProgress ? monthProgress.percentage : percentage
  const streak = getHabitStreak(habit.id)
  const today = getLocalDateStr()
  const isDaily = habit.frequency === 'daily'
  const canCheckToday = isDaily || isWeekday(today)

  return (
    <>
      <ContextMenu
        items={[
          {
            label: 'Editar',
            icon: <Pencil className="h-4 w-4" />,
            onSelect: () => setDetailOpen(true),
          },
          {
            label: 'Excluir',
            icon: <Trash2 className="h-4 w-4" />,
            destructive: true,
            onSelect: () => setConfirmOpen(true),
          },
        ]}
      >
        <div
          className="rounded-xl border border-border bg-card p-4 space-y-3 cursor-pointer"
          onClick={() => setDetailOpen(true)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-foreground">{habit.name}</p>
                {streak > 0 && (
                  <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-orange-500">
                    <Flame className="h-3 w-3" />
                    {streak}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {monthProgress ? (
                  `${monthProgress.count} / ${monthProgress.target} dias este mês`
                ) : isRoutine ? (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <PartyPopper className="h-3.5 w-3.5" />
                    Virou rotina!
                  </span>
                ) : (
                  `${count} / ${target} ${isDaily ? 'dias' : 'dias úteis'}`
                )}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setConfirmOpen(true)
              }}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Excluir rotina"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                !habit.eternal && isRoutine
                  ? 'bg-gradient-to-r from-emerald-500 to-primary'
                  : 'bg-gradient-to-r from-primary/70 to-primary'
              }`}
              style={{ width: `${barPercentage}%` }}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleHabitToday(habit.id)
            }}
            disabled={!canCheckToday}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              checkedToday
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Check className="h-4 w-4" />
            {!canCheckToday
              ? 'Fim de semana — sem meta hoje'
              : checkedToday
                ? 'Feito hoje'
                : 'Marcar hoje'}
          </button>
        </div>
      </ContextMenu>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir rotina"
        description={`Tem certeza que deseja excluir "${habit.name}"? Todo o progresso será perdido.`}
        onConfirm={() => {
          deleteHabit(habit.id)
          setConfirmOpen(false)
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      {detailOpen && <HabitDetailDialog habit={habit} onClose={() => setDetailOpen(false)} />}
    </>
  )
}
