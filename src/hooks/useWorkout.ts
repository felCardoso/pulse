"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import {
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutsByUser,
  addExercise,
  updateExercise,
  deleteExercise,
} from "@/lib/services/workout-service"
import type { WorkoutFormData, ExerciseFormData } from "@/types"

export function useWorkouts() {
  const { user } = useAppStore()
  return useQuery({
    queryKey: ["workouts", user?.id],
    queryFn: () => getWorkoutsByUser(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateWorkout() {
  const qc = useQueryClient()
  const { user, addWorkout } = useAppStore()
  return useMutation({
    mutationFn: (data: WorkoutFormData) => createWorkout(user!.id, data),
    onSuccess: (workout) => {
      addWorkout(workout)
      qc.invalidateQueries({ queryKey: ["workouts"] })
    },
  })
}

export function useUpdateWorkout() {
  const qc = useQueryClient()
  const { updateWorkout: updateStore } = useAppStore()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkoutFormData> }) =>
      updateWorkout(id, data),
    onSuccess: (workout) => {
      updateStore(workout.id, workout)
      qc.invalidateQueries({ queryKey: ["workouts"] })
    },
  })
}

export function useDeleteWorkout() {
  const qc = useQueryClient()
  const { removeWorkout } = useAppStore()
  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onMutate: (id) => removeWorkout(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  })
}

export function useAddExercise(workoutId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ExerciseFormData) => addExercise(workoutId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  })
}

export function useUpdateExercise(workoutId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      exerciseId,
      data,
    }: {
      exerciseId: string
      data: Partial<ExerciseFormData & { completed: boolean }>
    }) => updateExercise(workoutId, exerciseId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  })
}

export function useDeleteExercise(workoutId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (exerciseId: string) => deleteExercise(workoutId, exerciseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  })
}
