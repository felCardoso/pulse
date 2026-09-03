'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Check, TrendingUp, Flame, Repeat, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SetRow from './SetRow'
import { useEchoStore } from '@/store/echo-store'
import { useHaptic } from '@/hooks/useHaptic'
import { useSound } from '@/hooks/useSound'
import { unlockAudio } from '@/lib/audio'
import { getAutoProgression } from '@/utils/progression'
import type { SessionExercise } from '@/types'

interface Props {
  exercise: SessionExercise
  isCurrentExercise: boolean
  weightUnit: 'kg' | 'lbs'
  onSetDone: (restSeconds: number, isRestPause?: boolean) => void
}

export default function ExerciseTracker({
  exercise,
  isCurrentExercise,
  weightUnit,
  onSetDone,
}: Props) {
  const [expanded, setExpanded] = useState(isCurrentExercise)
  const [showSwap, setShowSwap] = useState(false)
  const [swapName, setSwapName] = useState('')
  const [timeValue, setTimeValue] = useState('')

  // Auto-expand when this exercise becomes the current one
  useEffect(() => {
    if (isCurrentExercise) setExpanded(true)
  }, [isCurrentExercise])

  // Auto-collapse once every set is done — the store then flips the next
  // exercise to current, which auto-expands it via the effect above.
  useEffect(() => {
    if (exercise.completed) setExpanded(false)
  }, [exercise.completed])

  const completeSet = useEchoStore((s) => s.completeSet)
  const completeTimeExercise = useEchoStore((s) => s.completeTimeExercise)
  const addWarmupSet = useEchoStore((s) => s.addWarmupSet)
  const replaceExerciseInActiveSession = useEchoStore((s) => s.replaceExerciseInActiveSession)
  const getLastSessionForExercise = useEchoStore((s) => s.getLastSessionForExercise)
  const getExerciseLibrary = useEchoStore((s) => s.getExerciseLibrary)
  const sessions = useEchoStore((s) => s.sessions)
  const haptic = useHaptic()
  const sound = useSound()

  const prev = getLastSessionForExercise(exercise.name)
  const workingSets = exercise.sets.filter((s) => !s.isWarmup)
  const doneWorkingSets = workingSets.filter((s) => s.done)
  const doneCount = doneWorkingSets.length

  // Automatic progression, computed from this exercise's rule + history.
  const auto =
    exercise.trackBy === 'reps' && !exercise.completed
      ? getAutoProgression(sessions, exercise.name, exercise.plannedReps, exercise.progression)
      : null

  // The last working set completed in THIS session takes precedence over
  // last session's values — completing set 1 pre-fills sets 2 and 3.
  const lastDone = doneWorkingSets[doneWorkingSets.length - 1]
  const hintWeight = lastDone?.weight ?? auto?.weight ?? prev?.weight
  const hintReps = lastDone?.reps ?? auto?.reps ?? prev?.reps

  const handleSetComplete = (
    setId: string,
    weight: number | undefined,
    reps: number | undefined,
    rir: number | undefined
  ) => {
    unlockAudio()
    const isPR = completeSet(exercise.id, setId, weight, reps, rir)
    if (isPR) {
      haptic.pr()
      sound.pr()
    } else {
      haptic.success()
      sound.setDone()
    }
    onSetDone(exercise.restSeconds, exercise.restPauseEnabled)
  }

  const handleTimeComplete = () => {
    const minutes = timeValue ? parseFloat(timeValue) : exercise.plannedDurationMinutes ?? 0
    if (isNaN(minutes) || minutes <= 0) return
    unlockAudio()
    completeTimeExercise(exercise.id, Math.round(minutes * 10) / 10)
    haptic.success()
    sound.setDone()
  }

  const handleSwap = () => {
    if (!swapName.trim()) return
    replaceExerciseInActiveSession(exercise.id, swapName)
    setShowSwap(false)
    setSwapName('')
  }

  const library = getExerciseLibrary()

  const subtitle = exercise.trackBy === 'time'
    ? `${exercise.plannedDurationMinutes ?? '—'} min`
    : `${exercise.plannedSets}×${exercise.plannedReps}` +
      (exercise.bodyweight ? ' · peso corporal' : '') +
      (exercise.restPauseEnabled
        ? ' · Rest-Pause'
        : exercise.restSeconds > 0
        ? ` · ${exercise.restSeconds >= 60 ? `${Math.floor(exercise.restSeconds / 60)}min` : `${exercise.restSeconds}s`} descanso`
        : '')

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
          {exercise.completed ? (
            <Check className="h-3.5 w-3.5" />
          ) : exercise.trackBy === 'time' ? (
            <Timer className="h-3.5 w-3.5" />
          ) : (
            exercise.order + 1
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{exercise.name}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums">
            {exercise.trackBy === 'time'
              ? exercise.completed
                ? `${exercise.actualDurationMinutes} min`
                : ''
              : `${doneCount}/${workingSets.length}`}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="space-y-2 border-t border-border px-4 pb-4 pt-3">
          {/* Time-based: single duration entry */}
          {exercise.trackBy === 'time' ? (
            exercise.completed ? (
              <p className="text-sm text-muted-foreground">
                Concluído: <span className="font-semibold text-foreground">{exercise.actualDurationMinutes} min</span>
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder={String(exercise.plannedDurationMinutes ?? 20)}
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  className="h-9 flex-1 text-center"
                />
                <span className="text-sm text-muted-foreground">min</span>
                <button
                  onClick={handleTimeComplete}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            )
          ) : (
            <>
              {prev && (
                <p className="text-xs text-muted-foreground mb-1">
                  Última sessão: {exercise.bodyweight ? 'peso corporal' : prev.weight != null ? `${prev.weight}${weightUnit}` : '—'} × {prev.reps ?? '—'}
                </p>
              )}

              {/* Automatic progression — always explained, never silent */}
              {auto && !lastDone && !exercise.bodyweight && (
                <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/8 px-3 py-2">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  <p className="text-xs text-foreground">{auto.reason}</p>
                </div>
              )}

              {/* Add a warm-up set on demand — goes in before the working sets */}
              {!exercise.completed && (
                <button
                  onClick={() => addWarmupSet(exercise.id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Flame className="h-3.5 w-3.5" />
                  Adicionar série de aquecimento
                </button>
              )}

              {exercise.sets.map((set) => (
                <SetRow
                  key={set.id}
                  set={set}
                  weightUnit={weightUnit}
                  previousWeight={hintWeight}
                  previousReps={hintReps}
                  bodyweight={exercise.bodyweight}
                  onComplete={(w, r, rir) => handleSetComplete(set.id, w, r, rir)}
                />
              ))}
            </>
          )}

          {/* Swap exercise */}
          {!exercise.completed && (
            <div className="pt-1">
              {showSwap ? (
                <div className="space-y-2">
                  <datalist id={`swap-lib-${exercise.id}`}>
                    {library.map((ex) => (
                      <option key={ex} value={ex} />
                    ))}
                  </datalist>
                  <Input
                    value={swapName}
                    list={`swap-lib-${exercise.id}`}
                    onChange={(e) => setSwapName(e.target.value)}
                    placeholder="Novo exercício (ex: máquina ocupada)"
                    className="h-9 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={() => {
                        setShowSwap(false)
                        setSwapName('')
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      disabled={!swapName.trim()}
                      onClick={handleSwap}
                    >
                      Trocar
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSwap(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Repeat className="h-3.5 w-3.5" />
                  Trocar exercício
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
