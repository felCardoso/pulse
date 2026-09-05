import type { WorkoutSession } from '@/types'

export interface StagnantExercise {
  name: string
  weight: number
}

/**
 * Reps-tracked, weighted exercises whose max weight hasn't changed across
 * their last `threshold` completed appearances — a signal it may be time
 * for a deload (reduce weight/volume for a week) instead of grinding at the
 * same load. Bodyweight exercises are excluded (no weight to compare).
 */
export function findStagnantExercises(
  sessions: WorkoutSession[],
  threshold = 3
): StagnantExercise[] {
  const completed = sessions.filter((s) => s.status === 'completed')
  const byExercise = new Map<string, { name: string; weights: number[] }>()

  for (const session of completed) {
    for (const ex of session.exercises) {
      if (ex.trackBy !== 'reps' || ex.bodyweight) continue
      const doneSets = ex.sets.filter((s) => s.done && s.weight != null && !s.isWarmup)
      if (doneSets.length === 0) continue
      const maxWeight = Math.max(...doneSets.map((s) => s.weight as number))

      const key = ex.name.trim().toLowerCase()
      const entry = byExercise.get(key) ?? { name: ex.name, weights: [] }
      // `completed` is newest-first, so the first `threshold` pushes here
      // are exactly the most recent appearances of this exercise.
      if (entry.weights.length < threshold) entry.weights.push(maxWeight)
      byExercise.set(key, entry)
    }
  }

  const stagnant: StagnantExercise[] = []
  for (const { name, weights } of Array.from(byExercise.values())) {
    if (weights.length < threshold) continue
    if (weights.every((w: number) => w === weights[0])) {
      stagnant.push({ name, weight: weights[0] })
    }
  }
  return stagnant
}
