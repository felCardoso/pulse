'use client'

import { useState } from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SetLog } from '@/types'

const WEIGHT_STEP = 2.5

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

  // One-tap logging: an empty field falls back to the placeholder value
  // (previous set in this session, or last session), so a stable workout
  // is a single ✓ per set with zero typing.
  const effectiveWeight = weight ? parseFloat(weight) : previousWeight
  const effectiveReps = reps ? parseInt(reps) : previousReps

  const handleDone = () => {
    if (effectiveReps == null || isNaN(effectiveReps)) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }
    onComplete(
      effectiveWeight != null && !isNaN(effectiveWeight) ? effectiveWeight : undefined,
      effectiveReps
    )
  }

  const stepWeight = (delta: number) => {
    const base = weight ? parseFloat(weight) : previousWeight ?? 0
    const next = Math.max(0, Math.round((base + delta) * 100) / 100)
    setWeight(String(next))
  }

  if (set.done) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-primary/8 px-3 py-2">
        <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
          {set.setNumber}
        </span>
        <span className="font-heading flex-1 text-sm text-muted-foreground line-through">
          {set.weight != null ? `${set.weight}${weightUnit}` : '—'} × {set.reps}
        </span>
        <Check className="h-4 w-4 text-primary" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5', shake && 'animate-shake')}>
      <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">
        {set.setNumber}
      </span>

      <button
        onClick={() => stepWeight(-WEIGHT_STEP)}
        className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        aria-label={`Diminuir ${WEIGHT_STEP}${weightUnit}`}
        tabIndex={-1}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <Input
        type="number"
        inputMode="decimal"
        placeholder={previousWeight != null ? String(previousWeight) : weightUnit}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="h-9 flex-1 min-w-0 text-center"
      />

      <button
        onClick={() => stepWeight(WEIGHT_STEP)}
        className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        aria-label={`Aumentar ${WEIGHT_STEP}${weightUnit}`}
        tabIndex={-1}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      <span className="text-muted-foreground">×</span>

      <Input
        type="number"
        inputMode="numeric"
        placeholder={previousReps != null ? String(previousReps) : 'reps'}
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="h-9 w-14 shrink-0 text-center"
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
