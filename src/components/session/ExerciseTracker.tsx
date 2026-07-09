'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Check, TrendingUp, Flame, Repeat, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SetRow from './SetRow'
import { usePulseStore } from '@/store/pulse-store'
import { useHaptic } from '@/hooks/useHaptic'
import { useSound } from '@/hooks/useSound'
import { unlockAudio } from '@/lib/audio'
import { getProgressionSuggestion, getWarmupScheme } from '@/utils/progression'
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
  const [showWarmup, setShowWarmup] = useState(false)
  const [useSuggestion, setUseSuggestion] = useState(false)
  const [showSwap, setShowSwap] = useState(false)
  const [swapName, setSwapName] = useState('')
  const [cardioMinutes, setCardioMinutes] = useState('')

  // Auto-expand when this exercise becomes the current one
  useEffect(() => {
    if (isCurrentExercise) setExpanded(true)
  }, [isCurrentExercise])

  // Auto-collapse once every set is done — the store then flips the next
  // exercise to current, which auto-expands it via the effect above.
  useEffect(() => {
    if (exercise.completed) setExpanded(false)
  }, [exercise.completed])

  const completeSet = usePulseStore((s) => s.completeSet)
  const completeCardioExercise = usePulseStore((s) => s.completeCardioExercise)
  const replaceExerciseInActiveSession = usePulseStore((s) => s.replaceExerciseInActiveSession)
  const getLastSessionForExercise = usePulseStore((s) => s.getLastSessionForExercise)
  const getExerciseLibrary = usePulseStore((s) => s.getExerciseLibrary)
  const sessions = usePulseStore((s) => s.sessions)
  const haptic = useHaptic()
  const sound = useSound()

  const prev = getLastSessionForExercise(exercise.name)
  const doneSets = exercise.sets.filter((s) => s.done)
  const doneCount = doneSets.length

  // Progressive overload: both of the last two sessions hit every planned
  // rep at the same weight → suggest +2.5kg. Opt-in via the chip.
  const progression =
    !exercise.isCardio && !exercise.completed
      ? getProgressionSuggestion(sessions, exercise.name)
      : null

  // The last set completed in THIS session takes precedence over last
  // session's values — completing set 1 pre-fills sets 2 and 3.
  const lastDone = doneSets[doneSets.length - 1]
  const suggestionWeight = useSuggestion && progression ? progression.suggestedWeight : undefined
  const hintWeight = lastDone?.weight ?? suggestionWeight ?? prev?.weight
  const hintReps = lastDone?.reps ?? prev?.reps

  const warmupBase = hintWeight ?? 0
  const warmup = warmupBase > 0 ? getWarmupScheme(warmupBase) : null

  const handleSetComplete = (setId: string, weight: number | undefined, reps: number | undefined) => {
    unlockAudio()
    completeSet(exercise.id, setId, weight, reps)
    haptic.success()
    sound.setDone()
    onSetDone(exercise.restSeconds)
  }

  const handleCardioComplete = () => {
    const minutes = cardioMinutes
      ? parseFloat(cardioMinutes)
      : exercise.plannedDurationMinutes ?? 0
    if (isNaN(minutes) || minutes <= 0) return
    unlockAudio()
    completeCardioExercise(exercise.id, Math.round(minutes * 10) / 10)
    haptic.success()
    sound.setDone()
  }

  const handleSwap = () => {
    if (!swapName.trim()) return
    replaceExerciseInActiveSession(exercise.id, swapName)
    setShowSwap(false)
    setSwapName('')
    setUseSuggestion(false)
  }

  const library = getExerciseLibrary()

  const subtitle = exercise.isCardio
    ? `${exercise.plannedDurationMinutes ?? '—'} min de cardio`
    : `${exercise.plannedSets}×${exercise.plannedReps}` +
      (exercise.restSeconds > 0
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
          ) : exercise.isCardio ? (
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
            {exercise.isCardio
              ? exercise.completed
                ? `${exercise.actualDurationMinutes} min`
                : ''
              : `${doneCount}/${exercise.sets.length}`}
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
          {/* Cardio: single time entry */}
          {exercise.isCardio ? (
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
                  value={cardioMinutes}
                  onChange={(e) => setCardioMinutes(e.target.value)}
                  className="h-9 flex-1 text-center"
                />
                <span className="text-sm text-muted-foreground">min</span>
                <button
                  onClick={handleCardioComplete}
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
                  Última sessão: {prev.weight != null ? `${prev.weight}${weightUnit}` : '—'} × {prev.reps ?? '—'}
                </p>
              )}

              {/* Progressive overload chip */}
              {progression && !lastDone && (
                <button
                  onClick={() => setUseSuggestion((v) => !v)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                    useSuggestion
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary/50 text-foreground hover:border-primary/40'
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>
                    Progressão: você fechou {progression.currentWeight}{weightUnit} 2× —{' '}
                    tente <span className="font-semibold">{progression.suggestedWeight}{weightUnit}</span>
                    {useSuggestion && ' ✓'}
                  </span>
                </button>
              )}

              {/* Warmup toggle */}
              {warmup && doneCount === 0 && (
                <div>
                  <button
                    onClick={() => setShowWarmup((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Flame className="h-3.5 w-3.5" />
                    {showWarmup ? 'Ocultar aquecimento' : 'Aquecimento sugerido'}
                  </button>
                  {showWarmup && (
                    <div className="mt-1.5 rounded-lg bg-secondary/50 px-3 py-2 space-y-0.5">
                      {warmup.map((w) => (
                        <p key={w.pct} className="text-xs text-muted-foreground tabular-nums">
                          {w.pct}% — <span className="font-medium text-foreground">{w.weight}{weightUnit}</span> × {w.reps}
                        </p>
                      ))}
                      <p className="text-[10px] text-muted-foreground/70 pt-0.5">
                        Baseado em {warmupBase}{weightUnit} de carga de trabalho
                      </p>
                    </div>
                  )}
                </div>
              )}

              {exercise.sets.map((set) => (
                <SetRow
                  key={set.id}
                  set={set}
                  weightUnit={weightUnit}
                  previousWeight={hintWeight}
                  previousReps={hintReps}
                  onComplete={(w, r) => handleSetComplete(set.id, w, r)}
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
