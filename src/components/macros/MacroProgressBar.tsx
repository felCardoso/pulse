'use client'

import { useMemo } from 'react'

interface Props {
  current: number
  target: number
}

export default function MacroProgressBar({ current, target }: Props) {
  const percentage = useMemo(() => Math.min(100, (current / target) * 100), [current, target])
  const isOver = current > target

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">Ingestão de calorias</p>
          <p className="text-3xl font-bold text-foreground">
            {current}
            <span className="text-base text-muted-foreground font-normal ml-1">/ {target} kcal</span>
          </p>
        </div>
        <p className={`text-2xl font-bold ${isOver ? 'text-orange-500' : 'text-primary'}`}>
          {Math.round(percentage)}%
        </p>
      </div>

      {/* Health bar style progress */}
      <div className="h-8 rounded-full bg-secondary overflow-hidden border border-border/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver
              ? 'bg-gradient-to-r from-orange-500 to-red-500'
              : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isOver && (
        <p className="text-xs text-orange-500 text-center">
          +{current - target} kcal acima da meta
        </p>
      )}
      {!isOver && (
        <p className="text-xs text-emerald-500 text-center">
          {target - current} kcal restantes
        </p>
      )}
    </div>
  )
}
