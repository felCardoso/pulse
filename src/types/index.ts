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
export type TaskPriority = "low" | "medium" | "high"
export type HabitFrequency = "daily" | "weekdays" | "weekend" | "custom"
export type PomodoroMode = "work" | "break" | "longBreak"

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
  items?: RoutineItem[]
}

export interface RoutineItem {
  id: string
  routineId: string
  title: string
  completed: boolean
  order: number
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

export interface SetLog {
  weight: number
  reps: number
  done: boolean
}

export interface Exercise {
  id: string
  workoutId: string
  name: string
  sets?: number | null
  reps?: number | null
  weight?: number | null
  duration?: number | null
  setsLog: string
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

export interface Task {
  id: string
  userId: string
  title: string
  description?: string | null
  priority: TaskPriority
  dueDate?: Date | null
  completed: boolean
  completedAt?: Date | null
  syncStatus: SyncStatus
  createdAt: Date
  updatedAt: Date
}

export interface Habit {
  id: string
  userId: string
  name: string
  description?: string | null
  color: string
  icon?: string | null
  frequency: HabitFrequency
  targetDays: DayOfWeek[]
  createdAt: Date
  updatedAt: Date
  logs?: HabitLog[]
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
  createdAt: Date
}

export interface Note {
  id: string
  userId: string
  title?: string | null
  content: string
  pinned: boolean
  syncStatus: SyncStatus
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  userId: string
  title: string
  targetValue: number
  currentValue: number
  unit?: string | null
  weekStart: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PomodoroState {
  isRunning: boolean
  mode: PomodoroMode
  timeLeft: number
  sessions: number
}

export interface SyncQueueItem {
  id: string
  userId: string
  operation: "create" | "update" | "delete"
  table: "Routine" | "Workout" | "Meal" | "Exercise" | "Task" | "Note" | "Goal"
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

export type TaskFormData = {
  title: string
  description?: string
  priority: TaskPriority
  dueDate?: Date
}

export type HabitFormData = {
  name: string
  description?: string
  color?: string
  icon?: string
  frequency: HabitFrequency
  targetDays?: DayOfWeek[]
}

export type NoteFormData = {
  title?: string
  content: string
  pinned?: boolean
}

export type GoalFormData = {
  title: string
  targetValue: number
  unit?: string
}
