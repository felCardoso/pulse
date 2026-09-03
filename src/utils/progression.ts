import type { WorkoutSession, SessionExercise, ProgressionConfig } from '@/types'

/** "8-12" → 12, "10" → 10 (targets the top of the range) */
function parseTargetReps(planned: string): number | null {
  const match = planned.match(/(\d+)\s*$/)
  return match ? parseInt(match[1]) : null
}

function round(w: number): number {
  return Math.round(w * 10) / 10
}

function workingSets(ex: SessionExercise) {
  return ex.sets.filter((s) => !s.isWarmup)
}

/** The most recent `count` completed occurrences of this exercise, newest first. */
function completedOccurrences(
  sessions: WorkoutSession[],
  norm: string,
  count: number
): SessionExercise[] {
  const found: SessionExercise[] = []
  for (const session of sessions) {
    if (session.status !== 'completed') continue
    const ex = session.exercises.find(
      (e) => e.trackBy === 'reps' && e.name.trim().toLowerCase() === norm
    )
    if (ex) {
      found.push(ex)
      if (found.length === count) break
    }
  }
  return found
}

export interface AutoProgressionResult {
  weight: number
  /** Only set for double progression — the rep target for the next session. */
  reps?: number
  /** Plain-language reason shown next to the pre-filled value. */
  reason: string
}

/**
 * Computes the next weight (and, for double progression, rep target) from
 * the exercise's progression rule and its most recent completed session(s).
 * Returns null when there's no rule, no history, or the exercise isn't
 * reps-based — the UI then falls back to just repeating the last weight.
 */
export function getAutoProgression(
  sessions: WorkoutSession[],
  exerciseName: string,
  plannedReps: string,
  config: ProgressionConfig | undefined
): AutoProgressionResult | null {
  if (!config || config.type === 'none') return null

  const norm = exerciseName.trim().toLowerCase()
  const [last, prior] = completedOccurrences(sessions, norm, 2)
  if (!last) return null

  const sets = workingSets(last).filter((s) => s.done && s.weight != null && s.reps != null)
  if (sets.length === 0) return null
  const lastWeight = Math.max(...sets.map((s) => s.weight as number))

  switch (config.type) {
    case 'linear': {
      const target = parseTargetReps(plannedReps)
      const allHit = target != null && sets.every((s) => (s.reps as number) >= target)
      if (allHit) {
        return {
          weight: round(lastWeight + config.step),
          reason: `Progressão linear: bateu todas as reps no último treino — +${config.step}`,
        }
      }
      return {
        weight: lastWeight,
        reason: 'Progressão linear: repita o peso até bater todas as reps',
      }
    }

    case 'greyskull': {
      // Convention: the last set is the AMRAP set that drives progression.
      const target = parseTargetReps(plannedReps) ?? 5
      const amrapReps = sets[sets.length - 1].reps as number

      if (amrapReps >= target * 2) {
        return {
          weight: round(lastWeight + config.step * 2),
          reason: `Greyskull LP: dobrou as reps no AMRAP — bônus de +${round(config.step * 2)}`,
        }
      }
      if (amrapReps >= target) {
        return {
          weight: round(lastWeight + config.step),
          reason: `Greyskull LP: bateu o AMRAP (${amrapReps} reps) — +${config.step}`,
        }
      }

      // Failed the AMRAP set — check whether the prior session also failed.
      const priorSets = prior
        ? workingSets(prior).filter((s) => s.done && s.reps != null)
        : []
      const priorTarget = prior ? parseTargetReps(prior.plannedReps) ?? target : target
      const priorAmrapReps = priorSets.length > 0 ? (priorSets[priorSets.length - 1].reps as number) : null
      const priorAlsoFailed = priorAmrapReps != null && priorAmrapReps < priorTarget

      if (priorAlsoFailed) {
        return {
          weight: round(lastWeight * 0.9),
          reason: 'Greyskull LP: falhou 2 treinos seguidos — deload de 10%',
        }
      }
      return {
        weight: lastWeight,
        reason: `Greyskull LP: não bateu o AMRAP (${amrapReps}/${target}) — repita o peso`,
      }
    }

    case 'double': {
      const from = config.repsFrom ?? 8
      const to = config.repsTo ?? 10
      const reps = sets.map((s) => s.reps as number)
      const minReps = Math.min(...reps)
      const allAtTop = reps.every((r) => r >= to)

      if (allAtTop) {
        return {
          weight: round(lastWeight + config.step),
          reps: from,
          reason: `Dupla progressão: bateu ${to} reps em todas as séries — +${config.step}, volte para ${from} reps`,
        }
      }
      const nextTarget = Math.min(to, Math.max(from, minReps + 1))
      return {
        weight: lastWeight,
        reps: nextTarget,
        reason: `Dupla progressão: mesmo peso, tente ${nextTarget} reps (faixa ${from}-${to})`,
      }
    }

    default:
      return null
  }
}
