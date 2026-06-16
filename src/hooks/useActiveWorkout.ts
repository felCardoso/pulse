'use client'

import { usePulseStore } from '@/store/pulse-store'

export function useActiveWorkout() {
  const activeSession = usePulseStore((s) => s.activeSession)
  const completeSet = usePulseStore((s) => s.completeSet)
  const updateActiveSession = usePulseStore((s) => s.updateActiveSession)
  const finishWorkout = usePulseStore((s) => s.finishWorkout)
  const cancelWorkout = usePulseStore((s) => s.cancelWorkout)
  const addExerciseToActiveSession = usePulseStore((s) => s.addExerciseToActiveSession)

  const exercises = activeSession?.exercises ?? []
  const doneCount = exercises.filter((e) => e.completed).length
  const isFinishable = exercises.length > 0 && doneCount === exercises.length

  const currentExercise = exercises.find((e) => !e.completed) ?? null

  return {
    activeSession,
    exercises,
    currentExercise,
    doneCount,
    totalCount: exercises.length,
    isFinishable,
    completeSet,
    updateActiveSession,
    finishWorkout,
    cancelWorkout,
    addExerciseToActiveSession,
  }
}
