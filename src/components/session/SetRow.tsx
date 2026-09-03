'use client'

import { useState } from 'react'
import { Check, Minus, Plus, Flame, Pencil, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useLongPress } from '@/hooks/useLongPress'
import type { SetLog } from '@/types'

const WEIGHT_STEP = 2.5

const RIR_LABELS = ['Falha', '1 na reserva', '2 na reserva', '3+ na reserva']

interface Props {
  set: SetLog
  weightUnit: 'kg' | 'lbs'
  previousWeight?: number
  previousReps?: number
  /** No weight is logged for this exercise — only reps. */
  bodyweight?: boolean
  onComplete: (weight: number | undefined, reps: number | undefined, rir: number | undefined) => void
  /** Patches an already-completed set instead of completing a new one. */
  onUpdate?: (weight: number | undefined, reps: number | undefined, rir: number | undefined) => void
  /** Only offered for warm-up sets — removes it from the exercise entirely. */
  onDelete?: () => void
}

export default function SetRow({
  set,
  weightUnit,
  previousWeight,
  previousReps,
  bodyweight,
  onComplete,
  onUpdate,
  onDelete,
}: Props) {
  const [weight, setWeight] = useState(set.weight != null ? String(set.weight) : '')
  const [reps, setReps] = useState(set.reps != null ? String(set.reps) : '')
  const [rir, setRir] = useState<number | undefined>(set.rir)
  const [shake, setShake] = useState(false)
  // Press-and-hold on an already-done set re-opens it for editing.
  const [editing, setEditing] = useState(false)

  const longPress = useLongPress(() => {
    if (!set.done) return
    setWeight(set.weight != null ? String(set.weight) : '')
    setReps(set.reps != null ? String(set.reps) : '')
    setRir(set.rir)
    setEditing(true)
  })

  // One-tap logging: an empty field falls back to the placeholder value
  // (previous set in this session, or last session), so a stable workout
  // is a single ✓ per set with zero typing.
  const effectiveWeight = bodyweight ? undefined : weight ? parseFloat(weight) : previousWeight
  const effectiveReps = reps ? parseInt(reps) : previousReps

  const handleDone = () => {
    if (effectiveReps == null || isNaN(effectiveReps)) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }
    const finalWeight = effectiveWeight != null && !isNaN(effectiveWeight) ? effectiveWeight : undefined
    if (editing) {
      onUpdate?.(finalWeight, effectiveReps, rir)
      setEditing(false)
    } else {
      onComplete(finalWeight, effectiveReps, rir)
    }
  }

  const cancelEdit = () => {
    setWeight(set.weight != null ? String(set.weight) : '')
    setReps(set.reps != null ? String(set.reps) : '')
    setRir(set.rir)
    setEditing(false)
  }

  const stepWeight = (delta: number) => {
    const base = weight ? parseFloat(weight) : previousWeight ?? 0
    const next = Math.max(0, Math.round((base + delta) * 100) / 100)
    setWeight(String(next))
  }

  const label = set.isWarmup ? (
    <span className="flex w-9 shrink-0 items-center justify-center gap-0.5 rounded bg-orange-500/15 py-0.5 text-[9px] font-semibold text-orange-500">
      <Flame className="h-2.5 w-2.5" />
      Aquec.
    </span>
  ) : (
    <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">
      {set.setNumber}
    </span>
  )

  if (set.done && !editing) {
    return (
      <div
        {...longPress}
        className="flex select-none items-center gap-3 rounded-lg bg-primary/8 px-3 py-2 active:bg-primary/15"
        style={{ touchAction: 'manipulation' }}
      >
        {label}
        <span className="font-heading flex-1 text-sm text-muted-foreground line-through">
          {bodyweight
            ? 'Peso corporal'
            : set.weight != null
              ? `${set.weight}${weightUnit}`
              : '—'} × {set.reps}
        </span>
        {set.rir != null && (
          <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            RIR {set.rir}
          </span>
        )}
        {set.isWarmup && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Excluir série de aquecimento"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        <Pencil className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        <Check className="h-4 w-4 shrink-0 text-primary" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-1.5', shake && 'animate-shake')}>
      <div className="flex items-center gap-1.5">
        {label}

        {!bodyweight && (
          <>
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
          </>
        )}

        <Input
          type="number"
          inputMode="numeric"
          placeholder={previousReps != null ? String(previousReps) : 'reps'}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className={cn('h-9 shrink-0 text-center', bodyweight ? 'flex-1' : 'w-14')}
        />

        {set.isWarmup && onDelete && !editing && (
          <button
            onClick={onDelete}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-destructive active:scale-95"
            aria-label="Excluir série de aquecimento"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {editing && (
          <button
            onClick={cancelEdit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:text-foreground active:scale-95"
            aria-label="Cancelar edição"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={handleDone}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>

      {/* RIR (Reps in Reserve) — 0 means true failure; the app uses this to
          hold back an auto progression increase instead of pushing further. */}
      {!set.isWarmup && (
        <div className="flex items-center gap-2 pl-6 pr-11">
          <span className="shrink-0 text-[10px] font-medium text-muted-foreground">RIR</span>
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={rir ?? 3}
            onChange={(e) => setRir(Number(e.target.value))}
            className="h-1.5 flex-1 accent-primary"
            aria-label="Repetições na reserva"
          />
          <span className="w-4 shrink-0 text-center text-[10px] font-semibold text-foreground tabular-nums">
            {rir ?? 3}
          </span>
        </div>
      )}
      {!set.isWarmup && (
        <p className="pl-6 pr-11 text-[9px] text-muted-foreground/70">
          {RIR_LABELS[rir ?? 3]}
        </p>
      )}
    </div>
  )
}
