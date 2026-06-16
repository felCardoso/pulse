'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SetLog } from '@/types'

interface Props {
  set: SetLog
  weightUnit: 'kg' | 'lbs'
  previousWeight?: number
  previousReps?: number
  onComplete: (weight: number | undefined, reps: number | undefined) => void
}

export default function SetRow({
  set,
  weightUnit,
  previousWeight,
  previousReps,
  onComplete,
}: Props) {
  const [weight, setWeight] = useState(set.weight != null ? String(set.weight) : '')
  const [reps, setReps] = useState(set.reps != null ? String(set.reps) : '')
  const [shake, setShake] = useState(false)

  const handleDone = () => {
    if (!reps) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }
    onComplete(weight ? parseFloat(weight) : undefined, parseInt(reps))
  }

  if (set.done) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-primary/8 px-3 py-2">
        <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
          {set.setNumber}
        </span>
        <span className="flex-1 text-sm text-muted-foreground line-through">
          {set.weight != null ? `${set.weight}${weightUnit}` : '—'} × {set.reps}
        </span>
        <Check className="h-4 w-4 text-primary" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', shake && 'animate-shake')}>
      <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">
        {set.setNumber}
      </span>

      <Input
        type="number"
        inputMode="decimal"
        placeholder={previousWeight != null ? String(previousWeight) : weightUnit}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="h-9 flex-1 text-center"
      />

      <span className="text-muted-foreground">×</span>

      <Input
        type="number"
        inputMode="numeric"
        placeholder={previousReps != null ? String(previousReps) : 'reps'}
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="h-9 w-20 text-center"
      />

      <button
        onClick={handleDone}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95"
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
  )
}
