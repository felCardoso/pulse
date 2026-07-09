'use client'

import { RotateCcw, Zap } from 'lucide-react'
import { usePulseStore } from '@/store/pulse-store'

// One-tap logging: chips for the most-used foods (with the grams used
// last time) plus a "repeat last meal" shortcut. Goal: register a
// routine meal without opening the add-meal sheet at all.
export default function QuickAddFoods() {
  const foods = usePulseStore((s) => s.foods)
  const dailyMacroLogs = usePulseStore((s) => s.dailyMacroLogs)
  const logMeal = usePulseStore((s) => s.logMeal)

  if (foods.length === 0 || dailyMacroLogs.length === 0) return null

  // Usage stats per food across ALL logs (not just today).
  const usage = new Map<string, { count: number; lastGrams: number; lastTimestamp: string }>()
  for (const log of dailyMacroLogs) {
    const entry = usage.get(log.foodId)
    if (!entry) {
      usage.set(log.foodId, { count: 1, lastGrams: log.gramsConsumed, lastTimestamp: log.timestamp })
    } else {
      entry.count += 1
      if (log.timestamp > entry.lastTimestamp) {
        entry.lastGrams = log.gramsConsumed
        entry.lastTimestamp = log.timestamp
      }
    }
  }

  const lastLog = dailyMacroLogs.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
  const lastFood = foods.find((f) => f.id === lastLog.foodId)

  const topFoods = foods
    .filter((f) => usage.has(f.id))
    .sort((a, b) => (usage.get(b.id)?.count ?? 0) - (usage.get(a.id)?.count ?? 0))
    .slice(0, 4)

  if (!lastFood && topFoods.length === 0) return null

  return (
    <div className="space-y-2">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        <Zap className="h-3.5 w-3.5" />
        Adicionar rápido
      </h2>
      <div className="flex flex-wrap gap-2">
        {lastFood && (
          <button
            onClick={() => logMeal(lastFood.id, lastLog.gramsConsumed)}
            className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="max-w-[140px] truncate">{lastFood.name}</span>
            <span className="text-primary/70">{lastLog.gramsConsumed}g</span>
          </button>
        )}
        {topFoods
          .filter((f) => f.id !== lastFood?.id)
          .map((food) => {
            const grams = usage.get(food.id)!.lastGrams
            return (
              <button
                key={food.id}
                onClick={() => logMeal(food.id, grams)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 active:scale-95"
              >
                <span className="max-w-[140px] truncate">{food.name}</span>
                <span className="text-muted-foreground">{grams}g</span>
              </button>
            )
          })}
      </div>
    </div>
  )
}
