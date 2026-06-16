'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import SetRow from './SetRow'
import { usePulseStore } from '@/store/pulse-store'
import { useHaptic } from '@/hooks/useHaptic'
import { useSound } from '@/hooks/useSound'
import { unlockAudio } from '@/lib/audio'
import type { SessionExercise } from '@/types'

interface Props {
  exercise: SessionExercise
  isCurrentExercise: boolean
  weightUnit: 'kg' | 'lbs'
  onSetDone: (restSeconds: number) => void
}

export default function ExerciseTracker({
  exercise,
  isCurrentExercise,
  weightUnit,
  onSetDone,
}: Props) {
  const [expanded, setExpanded] = useState(isCurrentExercise)

  // Auto-expand when this exercise becomes the current one
  useEffect(() => {
    if (isCurrentExercise) setExpanded(true)
  }, [isCurrentExercise])
  const completeSet = usePulseStore((s) => s.completeSet)
  const getLastSessionForExercise = usePulseStore((s) => s.getLastSessionForExercise)
  const haptic = useHaptic()
  const sound = useSound()

  const prev = getLastSessionForExercise(exercise.name)
  const doneCount = exercise.sets.filter((s) => s.done).length

  const handleSetComplete = (setId: string, weight: number | undefined, reps: number | undefined) => {
    unlockAudio()
    completeSet(exercise.id, setId, weight, reps)
    haptic.success()
    sound.setDone()
    onSetDone(exercise.restSeconds)
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-all',
        exercise.completed
          ? 'border-primary/30 opacity-60'
          : isCurrentExercise
          ? 'border-primary/50'
          : 'border-border'
      )}
    >
      {/* Header */}
      <button
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
            exercise.completed
              ? 'bg-primary text-primary-foreground'
              : isCurrentExercise
              ? 'bg-primary/20 text-primary'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {exercise.completed ? <Check className="h-3.5 w-3.5" /> : exercise.order + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{exercise.name}</p>
          <p className="text-xs text-muted-foreground">
            {exercise.plannedSets}×{exercise.plannedReps}
            {exercise.restSeconds > 0 &&
              ` · ${exercise.restSeconds >= 60 ? `${Math.floor(exercise.restSeconds / 60)}min` : `${exercise.restSeconds}s`} descanso`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            {doneCount}/{exercise.sets.length}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Sets */}
      {expanded && (
        <div className="space-y-2 border-t border-border px-4 pb-4 pt-3">
          {prev && (
            <p className="text-xs text-muted-foreground mb-1">
              Última sessão: {prev.weight != null ? `${prev.weight}${weightUnit}` : '—'} × {prev.reps ?? '—'}
            </p>
          )}
          {exercise.sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              weightUnit={weightUnit}
              previousWeight={prev?.weight}
              previousReps={prev?.reps}
              onComplete={(w, r) => handleSetComplete(set.id, w, r)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
