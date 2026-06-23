'use client'

import { Trash2 } from 'lucide-react'
import { usePulseStore } from '@/store/pulse-store'
import type { DailyMacroLog } from '@/types'

interface Props {
  logs: DailyMacroLog[]
}

export default function MealLog({ logs }: Props) {
  const deleteLog = (id: string) => {
    usePulseStore.setState((s) => ({
      dailyMacroLogs: s.dailyMacroLogs.filter((l) => l.id !== id),
    }))
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Nenhuma refeição registrada hoje</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Refeições do dia
      </h2>
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {log.foodName}
            </p>
            <p className="text-xs text-muted-foreground">
              {log.gramsConsumed}g · {log.kcal} kcal
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              P: {log.protein}g | C: {log.carbs}g | G: {log.fat}g
            </p>
          </div>
          <button
            onClick={() => deleteLog(log.id)}
            className="shrink-0 ml-3 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
