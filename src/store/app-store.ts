import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Routine, Workout, Meal } from "@/types"

interface AppState {
  user: User | null
  routines: Routine[]
  workouts: Workout[]
  meals: Meal[]
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  selectedRoutine: Routine | null
  selectedWorkout: Workout | null

  setUser: (user: User | null) => void
  setRoutines: (routines: Routine[]) => void
  addRoutine: (routine: Routine) => void
  updateRoutine: (id: string, data: Partial<Routine>) => void
  removeRoutine: (id: string) => void
  setWorkouts: (workouts: Workout[]) => void
  addWorkout: (workout: Workout) => void
  updateWorkout: (id: string, data: Partial<Workout>) => void
  removeWorkout: (id: string) => void
  setMeals: (meals: Meal[]) => void
  addMeal: (meal: Meal) => void
  updateMeal: (id: string, data: Partial<Meal>) => void
  removeMeal: (id: string) => void
  setOnline: (online: boolean) => void
  setSyncing: (syncing: boolean) => void
  setPendingCount: (count: number) => void
  setSelectedRoutine: (routine: Routine | null) => void
  setSelectedWorkout: (workout: Workout | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      routines: [],
      workouts: [],
      meals: [],
      isOnline: true,
      isSyncing: false,
      pendingCount: 0,
      selectedRoutine: null,
      selectedWorkout: null,

      setUser: (user) => set({ user }),
      setRoutines: (routines) => set({ routines }),
      addRoutine: (routine) => set((s) => ({ routines: [routine, ...s.routines] })),
      updateRoutine: (id, data) =>
        set((s) => ({
          routines: s.routines.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),
      removeRoutine: (id) => set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      setWorkouts: (workouts) => set({ workouts }),
      addWorkout: (workout) => set((s) => ({ workouts: [workout, ...s.workouts] })),
      updateWorkout: (id, data) =>
        set((s) => ({
          workouts: s.workouts.map((w) => (w.id === id ? { ...w, ...data } : w)),
        })),
      removeWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      setMeals: (meals) => set({ meals }),
      addMeal: (meal) => set((s) => ({ meals: [meal, ...s.meals] })),
      updateMeal: (id, data) =>
        set((s) => ({ meals: s.meals.map((m) => (m.id === id ? { ...m, ...data } : m)) })),
      removeMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

      setOnline: (isOnline) => set({ isOnline }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      setPendingCount: (pendingCount) => set({ pendingCount }),
      setSelectedRoutine: (selectedRoutine) => set({ selectedRoutine }),
      setSelectedWorkout: (selectedWorkout) => set({ selectedWorkout }),
    }),
    {
      name: "dailypulse-store",
      partialize: (s) => ({
        routines: s.routines,
        workouts: s.workouts,
        meals: s.meals,
      }),
    }
  )
)
