export type SyncStatus = "pending" | "synced" | "error"

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export interface User {
  id: string
  email: string
  name?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Routine {
  id: string
  userId: string
  name: string
  description?: string | null
  day: DayOfWeek
  time?: string | null
  completed: boolean
  completedAt?: Date | null
  syncStatus: SyncStatus
  remoteId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Workout {
  id: string
  userId: string
  name: string
  description?: string | null
  date: Date
  completed: boolean
  syncStatus: SyncStatus
  remoteId?: string | null
  createdAt: Date
  updatedAt: Date
  exercises?: Exercise[]
}

export interface Exercise {
  id: string
  workoutId: string
  name: string
  sets?: number | null
  reps?: number | null
  weight?: number | null
  duration?: number | null
  completed: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Meal {
  id: string
  userId: string
  name: string
  description?: string | null
  date: Date
  mealType: MealType
  calories?: number | null
  protein?: number | null
  carbs?: number | null
  fat?: number | null
  syncStatus: SyncStatus
  remoteId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SyncQueueItem {
  id: string
  userId: string
  operation: "create" | "update" | "delete"
  table: "Routine" | "Workout" | "Meal" | "Exercise"
  recordId: string
  data: string
  retries: number
  lastError?: string | null
  createdAt: Date
}

export type RoutineFormData = {
  name: string
  description?: string
  day: DayOfWeek
  time?: string
}

export type WorkoutFormData = {
  name: string
  description?: string
  date?: Date
}

export type ExerciseFormData = {
  name: string
  sets?: number
  reps?: number
  weight?: number
  duration?: number
}

export type MealFormData = {
  name: string
  description?: string
  date?: Date
  mealType: MealType
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}
