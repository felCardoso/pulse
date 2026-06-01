"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAppStore } from "@/store/app-store"
import {
  createMeal,
  updateMeal,
  deleteMeal,
  getMealsByUser,
} from "@/lib/services/diet-service"
import type { MealFormData } from "@/types"

export function useMeals() {
  const { user } = useAppStore()
  return useQuery({
    queryKey: ["meals", user?.id],
    queryFn: () => getMealsByUser(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateMeal() {
  const qc = useQueryClient()
  const { user, addMeal } = useAppStore()
  return useMutation({
    mutationFn: (data: MealFormData) => createMeal(user!.id, data),
    onSuccess: (meal) => {
      addMeal(meal)
      qc.invalidateQueries({ queryKey: ["meals"] })
    },
  })
}

export function useUpdateMeal() {
  const qc = useQueryClient()
  const { updateMeal: updateStore } = useAppStore()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MealFormData> }) =>
      updateMeal(id, data),
    onSuccess: (meal) => {
      updateStore(meal.id, meal)
      qc.invalidateQueries({ queryKey: ["meals"] })
    },
  })
}

export function useDeleteMeal() {
  const qc = useQueryClient()
  const { removeMeal } = useAppStore()
  return useMutation({
    mutationFn: (id: string) => deleteMeal(id),
    onMutate: (id) => removeMeal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meals"] }),
  })
}
