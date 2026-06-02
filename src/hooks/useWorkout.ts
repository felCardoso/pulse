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
  parseSetsLog,
} from "@/lib/services/workout-service"
import type { Workout, WorkoutFormData, ExerciseFormData, SetLog, Exercise } from "@/types"
import { v4 as uuid } from "uuid"

export function useWorkouts() {
  const { user, workouts: localWorkouts, setWorkouts } = useAppStore()

  return useQuery({
    queryKey: ["workouts", user?.id],
    queryFn: async () => {
      const data = await getWorkoutsByUser(user!.id)
      setWorkouts(data)
      return data
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    initialData: localWorkouts.length > 0 ? localWorkouts : undefined,
  })
}

export function useCreateWorkout() {
  const qc = useQueryClient()
  const { user, addWorkout } = useAppStore()

  return useMutation({
    mutationFn: (data: WorkoutFormData) => createWorkout(user!.id, data),
    onMutate: (data) => {
      const optimistic: Workout = {
        id: uuid(),
        userId: user!.id,
        name: data.name,
        description: data.description ?? null,
        date: data.date ?? new Date(),
        completed: false,
        syncStatus: "pending",
        remoteId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [],
      }
      addWorkout(optimistic)
      return { optimistic }
    },
    onSuccess: (workout, _vars, ctx) => {
      const { removeWorkout, addWorkout } = useAppStore.getState()
      removeWorkout(ctx!.optimistic.id)
      addWorkout(workout)
      qc.invalidateQueries({ queryKey: ["workouts"] })
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.optimistic) {
        useAppStore.getState().updateWorkout(ctx.optimistic.id, { syncStatus: "pending" })
      }
    },
  })
}

type WorkoutMetaUpdate = Omit<WorkoutFormData, "exercises">

export function useUpdateWorkout() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkoutMetaUpdate> }) =>
      updateWorkout(id, data),
    onMutate: ({ id, data }) => {
      useAppStore.getState().updateWorkout(id, { ...data, syncStatus: "pending" })
    },
    onSuccess: (workout) => {
      useAppStore.getState().updateWorkout(workout.id, { ...workout, syncStatus: "synced" })
      qc.invalidateQueries({ queryKey: ["workouts"] })
    },
  })
}

export function useDeleteWorkout() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onMutate: (id) => {
      useAppStore.getState().removeWorkout(id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  })
}

export function useAddExercise(workoutId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ExerciseFormData) => addExercise(workoutId, data),
    onSuccess: (exercise) => {
      const { workouts, setWorkouts } = useAppStore.getState()
      setWorkouts(
        workouts.map((w) =>
          w.id === workoutId
            ? { ...w, exercises: [...(w.exercises ?? []), exercise] }
            : w
        )
      )
      qc.invalidateQueries({ queryKey: ["workouts"] })
    },
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
      data: Partial<ExerciseFormData & { completed: boolean; setsLog: string }>
    }) => updateExercise(workoutId, exerciseId, data),
    onMutate: ({ exerciseId, data }) => {
      const { workouts, setWorkouts } = useAppStore.getState()
      setWorkouts(
        workouts.map((w) =>
          w.id === workoutId
            ? {
                ...w,
                exercises: (w.exercises ?? []).map((e) =>
                  e.id === exerciseId ? { ...e, ...data } : e
                ),
              }
            : w
        )
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  })
}

export function useDeleteExercise(workoutId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (exerciseId: string) => deleteExercise(workoutId, exerciseId),
    onMutate: (exerciseId) => {
      const { workouts, setWorkouts } = useAppStore.getState()
      setWorkouts(
        workouts.map((w) =>
          w.id === workoutId
            ? { ...w, exercises: (w.exercises ?? []).filter((e) => e.id !== exerciseId) }
            : w
        )
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  })
}

export function useFinalizeWorkout(workoutId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (exercises: Pick<Exercise, "id" | "setsLog" | "completed">[]) => {
      const res = await fetch(`/api/workouts/${workoutId}/finalize`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to finalize workout")
      }
      return res.json() as Promise<Workout>
    },
    onSuccess: (workout) => {
      const { workouts, setWorkouts } = useAppStore.getState()
      setWorkouts(workouts.map((w) => (w.id === workoutId ? workout : w)))
      qc.invalidateQueries({ queryKey: ["workouts"] })
    },
  })
}

/** Returns the setsLog from the most recent OTHER workout that has an exercise with this name */
export function useExerciseHistory(currentWorkoutId: string, exerciseName: string): {
  sets: SetLog[]
  date: Date
} | null {
  const { workouts } = useAppStore()
  const lower = exerciseName.toLowerCase().trim()

  const match = workouts
    .filter((w) => w.id !== currentWorkoutId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .flatMap((w) =>
      (w.exercises ?? [])
        .filter((e) => e.name.toLowerCase().trim() === lower)
        .map((e) => ({ sets: parseSetsLog(e.setsLog), date: new Date(w.date) }))
    )
    .find((x) => x.sets.length > 0)

  return match ?? null
}
