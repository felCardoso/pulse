'use client'

import { useState } from 'react'
import { TrendingDown, X } from 'lucide-react'
import type { StagnantExercise } from '@/utils/stagnation'

interface Props {
  exercises: StagnantExercise[]
}

/** Warns when one or more exercises haven't gained weight across their last
 * few sessions — a nudge to consider a deload instead of grinding at the
 * same load. Dismissible for this view; reappears on reload while it still
 * applies (clears itself once the weight actually changes). */
export default function StagnationAlert({ exercises }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || exercises.length === 0) return null

  const [first, second] = exercises
  const extra = exercises.length - 2

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
        <TrendingDown className="h-4 w-4 text-amber-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {first.name}
          {second ? ` e ${second.name}` : ''}
          {extra > 0 ? ` (+${extra})` : ''} sem evoluir
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Mesma carga nas últimas sessões — considere um deload (reduzir peso/volume por uma
          semana) antes de seguir tentando forçar.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dispensar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
