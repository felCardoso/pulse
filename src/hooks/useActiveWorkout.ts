'use client'

import { useEchoStore } from '@/store/echo-store'

export function useActiveWorkout() {
  const activeSession = useEchoStore((s) => s.activeSession)
  const completeSet = useEchoStore((s) => s.completeSet)
  const updateActiveSession = useEchoStore((s) => s.updateActiveSession)
  const finishWorkout = useEchoStore((s) => s.finishWorkout)
  const cancelWorkout = useEchoStore((s) => s.cancelWorkout)
  const addExerciseToActiveSession = useEchoStore((s) => s.addExerciseToActiveSession)

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
