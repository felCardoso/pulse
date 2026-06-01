"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import {
  createRoutine,
  updateRoutine,
  deleteRoutine,
  checkRoutine,
  getRoutinesByUser,
} from "@/lib/services/routine-service"
import type { RoutineFormData, DayOfWeek } from "@/types"

export function useRoutines() {
  const { user } = useAppStore()
  return useQuery({
    queryKey: ["routines", user?.id],
    queryFn: () => getRoutinesByUser(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRoutinesByDay(day: DayOfWeek) {
  const { data: routines = [] } = useRoutines()
  return routines.filter((r) => r.day === day)
}

export function useCreateRoutine() {
  const qc = useQueryClient()
  const { user, addRoutine } = useAppStore()
  return useMutation({
    mutationFn: (data: RoutineFormData) => createRoutine(user!.id, data),
    onSuccess: (routine) => {
      addRoutine(routine)
      qc.invalidateQueries({ queryKey: ["routines"] })
    },
  })
}

export function useUpdateRoutine() {
  const qc = useQueryClient()
  const { updateRoutine: updateStore } = useAppStore()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoutineFormData> }) =>
      updateRoutine(id, data),
    onSuccess: (routine) => {
      updateStore(routine.id, routine)
      qc.invalidateQueries({ queryKey: ["routines"] })
    },
  })
}

export function useDeleteRoutine() {
  const qc = useQueryClient()
  const { removeRoutine } = useAppStore()
  return useMutation({
    mutationFn: (id: string) => deleteRoutine(id),
    onMutate: (id) => removeRoutine(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routines"] }),
  })
}

export function useCheckRoutine() {
  const qc = useQueryClient()
  const { updateRoutine: updateStore } = useAppStore()
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      checkRoutine(id, completed),
    onSuccess: (routine) => {
      updateStore(routine.id, routine)
      qc.invalidateQueries({ queryKey: ["routines"] })
    },
  })
}
