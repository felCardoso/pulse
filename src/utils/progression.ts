import type { WorkoutSession, SessionExercise } from '@/types'

const INCREMENT_KG = 2.5

/** "8-12" → 12, "10" → 10 (targets the top of the range) */
function parseTargetReps(planned: string): number | null {
  const match = planned.match(/(\d+)\s*$/)
  return match ? parseInt(match[1]) : null
}

export interface ProgressionSuggestion {
  currentWeight: number
  suggestedWeight: number
}

/**
 * Progressive-overload hint: if the last two completed sessions hit every
 * planned set at (or above) the target reps with the same top weight,
 * suggest adding 2.5kg.
 */
export function getProgressionSuggestion(
  sessions: WorkoutSession[],
  exerciseName: string
): ProgressionSuggestion | null {
  const norm = exerciseName.trim().toLowerCase()

  // sessions are stored newest-first
  const occurrences: SessionExercise[] = []
  for (const session of sessions) {
    if (session.status !== 'completed') continue
    const ex = session.exercises.find(
      (e) => !e.isCardio && e.name.trim().toLowerCase() === norm && e.sets.length > 0
    )
    if (ex) occurrences.push(ex)
    if (occurrences.length === 2) break
  }
  if (occurrences.length < 2) return null

  const topWeights: number[] = []
  for (const ex of occurrences) {
    const target = parseTargetReps(ex.plannedReps)
    if (target == null) return null
    const allHit = ex.sets.every(
      (s) => s.done && s.weight != null && s.reps != null && s.reps >= target
    )
    if (!allHit) return null
    topWeights.push(Math.max(...ex.sets.map((s) => s.weight as number)))
  }

  const [latest, prior] = topWeights
  if (latest <= 0 || Math.abs(latest - prior) > 0.01) return null

  return {
    currentWeight: latest,
    suggestedWeight: Math.round((latest + INCREMENT_KG) * 10) / 10,
  }
}

/** Warmup scheme derived from the working weight, rounded to 2.5kg steps. */
export function getWarmupScheme(workingWeight: number) {
  const round = (w: number) => Math.max(0, Math.round(w / 2.5) * 2.5)
  return [
    { pct: 40, weight: round(workingWeight * 0.4), reps: 10 },
    { pct: 60, weight: round(workingWeight * 0.6), reps: 6 },
    { pct: 80, weight: round(workingWeight * 0.8), reps: 3 },
  ]
}
