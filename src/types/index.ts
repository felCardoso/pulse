export interface ExerciseTemplate {
  id: string
  name: string
  sets: number
  reps: string
  restSeconds: number
  notes?: string
  order: number
}

export interface WorkoutTemplate {
  id: string
  name: string
  description?: string
  exercises: ExerciseTemplate[]
  createdAt: string
  updatedAt: string
}

export interface SetLog {
  id: string
  setNumber: number
  weight?: number
  reps?: number
  done: boolean
  doneAt?: string
}

export interface SessionExercise {
  id: string
  templateExerciseId?: string
  name: string
  plannedSets: number
  plannedReps: string
  restSeconds: number
  sets: SetLog[]
  completed: boolean
  order: number
}

export interface WorkoutSession {
  id: string
  templateId?: string
  name: string
  date: string
  startedAt: string
  finishedAt?: string
  duration?: number
  exercises: SessionExercise[]
  notes?: string
  status: 'active' | 'completed'
}

export interface PersonalRecord {
  exerciseName: string
  maxWeight: number
  maxVolume: number
  achievedAt: string
  sessionId: string
}

export interface AppSettings {
  primaryHue: number
  weightUnit: 'kg' | 'lbs'
  defaultRestSeconds: number
  hapticEnabled: boolean
  soundEnabled: boolean
}

export interface MacroFood {
  id: string
  name: string
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  lastUsedAt?: string
}

export interface DailyMacroLog {
  id: string
  date: string
  foodId: string
  foodName: string
  gramsConsumed: number
  kcal: number
  protein: number
  carbs: number
  fat: number
  timestamp: string
}

export interface MacroTargets {
  kcal: number
  protein: number
  carbs: number
  fat: number
}
