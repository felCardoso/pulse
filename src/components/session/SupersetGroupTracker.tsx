'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Check, Repeat, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import SetRow from './SetRow'
import { useEchoStore } from '@/store/echo-store'
import { useHaptic } from '@/hooks/useHaptic'
import { useSound } from '@/hooks/useSound'
import { unlockAudio } from '@/lib/audio'
import { getAutoProgression } from '@/utils/progression'
import type { SessionExercise } from '@/types'

interface Props {
  group: SessionExercise[]
  isCurrentGroup: boolean
  weightUnit: 'kg' | 'lbs'
  onSetDone: (restSeconds: number, isRestPause?: boolean) => void
}

/** A superset (2 exercises) or circuit (3+) — sets are logged round by
 * round, alternating exercises with no rest between them. Rest only kicks
 * in after the round's last exercise finishes its set. */
export default function SupersetGroupTracker({ group, isCurrentGroup, weightUnit, onSetDone }: Props) {
  const [expanded, setExpanded] = useState(isCurrentGroup)

  useEffect(() => {
    if (isCurrentGroup) setExpanded(true)
  }, [isCurrentGroup])

  const allCompleted = group.every((e) => e.completed)
  useEffect(() => {
    if (allCompleted) setExpanded(false)
  }, [allCompleted])

  const completeSet = useEchoStore((s) => s.completeSet)
  const updateDoneSet = useEchoStore((s) => s.updateDoneSet)
  const removeWarmupSet = useEchoStore((s) => s.removeWarmupSet)
  const completeTimeExercise = useEchoStore((s) => s.completeTimeExercise)
  const getLastSessionForExercise = useEchoStore((s) => s.getLastSessionForExercise)
  const sessions = useEchoStore((s) => s.sessions)
  const haptic = useHaptic()
  const sound = useSound()

  const label = group.length > 2 ? 'Circuito' : 'Superset'
  const title = group.map((e) => e.name).join(' + ')

  // Time-tracked members have no set list — count each as one unit,
  // done once its single duration entry is logged.
  const doneWorking = group.reduce(
    (n, e) =>
      n + (e.trackBy === 'time' ? (e.completed ? 1 : 0) : e.sets.filter((s) => !s.isWarmup && s.done).length),
    0
  )
  const totalWorking = group.reduce(
    (n, e) => n + (e.trackBy === 'time' ? 1 : e.sets.filter((s) => !s.isWarmup).length),
    0
  )

  const repsMembers = group.filter((e) => e.trackBy === 'reps')
  const timeMembers = group.filter((e) => e.trackBy === 'time')
  const warmupMembers = repsMembers.filter((e) => e.sets.some((s) => s.isWarmup))
  const roundsCount = repsMembers.reduce(
    (max, e) => Math.max(max, e.sets.filter((s) => !s.isWarmup).length),
    0
  )
  // Whichever exercise is last in the chain (by original order) is what
  // truly ends the round/group — if that's a time-tracked member, no
  // reps round ever counts as "last" and rest only fires once that
  // member's own duration is logged, below.
  const finalMember = group[group.length - 1]
  const finalMemberEndsRound = (exercise: SessionExercise) => exercise.id === finalMember.id

  // The auto-progression hint only depends on the exercise, not the
  // round — compute it once per member instead of once per round×member.
  const hints = new Map(
    repsMembers.map((exercise) => {
      const workingSets = exercise.sets.filter((s) => !s.isWarmup)
      const prev = getLastSessionForExercise(exercise.name)
      const doneWorkingSets = workingSets.filter((s) => s.done)
      const lastDone = doneWorkingSets[doneWorkingSets.length - 1]
      const auto = !exercise.completed
        ? getAutoProgression(sessions, exercise.name, exercise.plannedReps, exercise.progression)
        : null
      return [
        exercise.id,
        {
          hintWeight: lastDone?.weight ?? auto?.weight ?? prev?.weight,
          hintReps: lastDone?.reps ?? auto?.reps ?? prev?.reps,
          auto,
          lastDone,
        },
      ] as const
    })
  )

  const handleSetComplete = (
    exercise: SessionExercise,
    setId: string,
    weight: number | undefined,
    reps: number | undefined,
    rir: number | undefined,
    triggersRest: boolean
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
    // No rest between exercises within a round — only the round's last
    // exercise (or a warm-up, which never gates rest) starts the timer.
    if (triggersRest) onSetDone(exercise.restSeconds, exercise.restPauseEnabled)
  }

  const handleTimeComplete = (exercise: SessionExercise, minutes: number) => {
    if (isNaN(minutes) || minutes <= 0) return
    unlockAudio()
    completeTimeExercise(exercise.id, minutes)
    haptic.success()
    sound.setDone()
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-all',
        allCompleted ? 'border-primary/30 opacity-60' : isCurrentGroup ? 'border-primary/50' : 'border-border'
      )}
    >
      <button
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
            allCompleted ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'
          )}
        >
          {allCompleted ? <Check className="h-3.5 w-3.5" /> : <Repeat className="h-3.5 w-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{title}</p>
          <p className="text-xs text-muted-foreground">
            {label} · {group.length} exercícios
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums">
            {doneWorking}/{totalWorking}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
          {warmupMembers.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-orange-500">
                <Flame className="h-3 w-3" />
                Aquecimento
              </p>
              {warmupMembers.map((exercise) => {
                const warm = exercise.sets.find((s) => s.isWarmup)
                if (!warm) return null
                return (
                  <div key={exercise.id + '-warmup'} className="space-y-1">
                    <p className="text-xs font-medium text-foreground">{exercise.name}</p>
                    <SetRow
                      set={warm}
                      weightUnit={weightUnit}
                      bodyweight={exercise.bodyweight}
                      onComplete={(w, r, rir) => handleSetComplete(exercise, warm.id, w, r, rir, false)}
                      onUpdate={(w, r, rir) => updateDoneSet(exercise.id, warm.id, { weight: w, reps: r, rir })}
                      onDelete={() => removeWarmupSet(exercise.id, warm.id)}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {Array.from({ length: roundsCount }, (_, r) => {
            // Rest starts once whichever member actually has the last set
            // in THIS round finishes it — not the last member by list
            // position, which breaks when an earlier member has more
            // sets than the one at the end of the chain. Time-tracked
            // members aren't per-round — they get their own rest trigger
            // below, independent of the reps rounds.
            const membersThisRound = repsMembers.filter(
              (e) => e.sets.filter((s) => !s.isWarmup)[r]
            )
            // Only ends the round/group if the chain doesn't continue into
            // a time-tracked member afterward — a reps round is never
            // "last" when the group's true final exercise is time-based.
            const lastMemberThisRound =
              finalMember.trackBy === 'reps' ? membersThisRound[membersThisRound.length - 1] : undefined

            return (
              <div key={r} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Rodada {r + 1}
                </p>
                {repsMembers.map((exercise) => {
                  const workingSets = exercise.sets.filter((s) => !s.isWarmup)
                  const set = workingSets[r]
                  if (!set) return null

                  const { hintWeight, hintReps, auto, lastDone } = hints.get(exercise.id)!
                  const isLastInRound = exercise === lastMemberThisRound

                  return (
                    <div key={exercise.id} className="space-y-1">
                      <p className="text-xs font-medium text-foreground">{exercise.name}</p>
                      {auto && !lastDone && !exercise.bodyweight && r === 0 && (
                        <p className="text-[11px] text-muted-foreground">{auto.reason}</p>
                      )}
                      <SetRow
                        set={set}
                        weightUnit={weightUnit}
                        previousWeight={hintWeight}
                        previousReps={hintReps}
                        bodyweight={exercise.bodyweight}
                        onComplete={(w, rr, rir) =>
                          handleSetComplete(exercise, set.id, w, rr, rir, isLastInRound)
                        }
                        onUpdate={(w, rr, rir) =>
                          updateDoneSet(exercise.id, set.id, { weight: w, reps: rr, rir })
                        }
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}

          {timeMembers.map((exercise) => (
            <TimeMemberRow
              key={exercise.id}
              exercise={exercise}
              onComplete={(minutes) => {
                handleTimeComplete(exercise, minutes)
                // Only the exercise that's truly last in the chain ends
                // the group and starts rest.
                if (finalMemberEndsRound(exercise)) onSetDone(exercise.restSeconds, exercise.restPauseEnabled)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TimeMemberRow({
  exercise,
  onComplete,
}: {
  exercise: SessionExercise
  onComplete: (minutes: number) => void
}) {
  const [value, setValue] = useState('')

  if (exercise.completed) {
    return (
      <p className="text-sm text-muted-foreground">
        {exercise.name} concluído:{' '}
        <span className="font-semibold text-foreground">{exercise.actualDurationMinutes} min</span>
      </p>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-foreground">{exercise.name}</p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder={String(exercise.plannedDurationMinutes ?? 20)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 flex-1 text-center"
        />
        <span className="text-sm text-muted-foreground">min</span>
        <button
          onClick={() => onComplete(value ? parseFloat(value) : exercise.plannedDurationMinutes ?? 0)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
