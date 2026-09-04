/**
 * Automatic weight progression applied between sessions:
 * - 'none': manual — no auto-suggested weight.
 * - 'linear': +step every session where all sets hit the target reps.
 * - 'greyskull': Greyskull LP — last set is AMRAP; hit the target reps to
 *   add +step, double the target to get a +2×step bonus, and fail twice in
 *   a row to trigger a 10% deload.
 * - 'double': double progression — weight stays fixed while reps climb from
 *   repsFrom to repsTo; hitting repsTo on every set adds +step and resets
 *   the rep target back to repsFrom.
 */
export type ProgressionType = 'none' | 'linear' | 'greyskull' | 'double'

export interface ProgressionConfig {
  type: ProgressionType
  /** Weight added when the lift progresses. */
  step: number
  /** Double progression only — bottom of the working rep range (default 8). */
  repsFrom?: number
  /** Double progression only — top of the rep range; hitting it triggers the weight jump (default 10). */
  repsTo?: number
}

export interface ExerciseTemplate {
  id: string
  name: string
  sets: number
  reps: string
  restSeconds: number
  notes?: string
  order: number
  /** Whether this exercise is logged by reps or by a duration. */
  trackBy: 'reps' | 'time'
  durationMinutes?: number
  /** No weight is logged — sets are tracked by reps alone (uses body weight). */
  bodyweight?: boolean
  /** Automatically adds a warm-up set before the working sets. */
  warmupEnabled?: boolean
  /** % of the working weight used for the auto warm-up set (default 60 = 40% lighter). */
  warmupPercent?: number
  /** Automatic weight progression rule for this exercise. */
  progression?: ProgressionConfig
  /**
   * Rest-Pause: every rest for this exercise is a fixed, silent 15s
   * countdown ending in a short double vibration instead of the normal
   * sound + configured duration — for training by feel, phone in pocket.
   */
  restPauseEnabled?: boolean
  /**
   * Superset/circuit: this exercise and the next one in the list alternate
   * set-by-set with no rest between them — rest only happens after the
   * last exercise in the chain finishes its set for that round. Chaining
   * this flag across 3+ consecutive exercises forms a circuit.
   */
  supersetWithNext?: boolean
  /** Worked one side at a time — counts double toward total training volume. */
  unilateral?: boolean
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
  /** A lighter warm-up set — excluded from PRs, volume, and progression. */
  isWarmup?: boolean
  /**
   * Reps in Reserve (0-3) — how many more reps you had left in the tank.
   * 0 means true failure. Used to hold back an auto progression increase
   * when a set was already maxed out, instead of pushing further.
   */
  rir?: number
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
  /** Whether this exercise is logged by reps or by a duration. */
  trackBy: 'reps' | 'time'
  plannedDurationMinutes?: number
  actualDurationMinutes?: number
  bodyweight?: boolean
  warmupEnabled?: boolean
  warmupPercent?: number
  progression?: ProgressionConfig
  restPauseEnabled?: boolean
  /** See ExerciseTemplate.supersetWithNext. */
  supersetWithNext?: boolean
  /** Worked one side at a time — counts double toward total training volume. */
  unilateral?: boolean
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
  /** Shows extra body-composition fields on the Progresso page */
  bioimpedance: boolean
  /**
   * Focus Mode: rest becomes a full-screen black display with a giant
   * countdown — tap the number to pause/resume, tap anywhere else for +10s.
   */
  focusModeEnabled: boolean
  /** Local notification reminding about today's workout when you open Início (once/day). */
  workoutReminders: boolean
  /** Local notification for pending Rotinas when you open the Rotinas tab (once/day). */
  routineReminders: boolean
}

export interface BodyMeasurement {
  id: string
  /** YYYY-MM-DD */
  date: string
  weightKg: number
  // Bioimpedance extras (only filled when the setting is enabled)
  bodyFatPct?: number
  musclePct?: number
  waterPct?: number
  visceralFat?: number
}

export interface ProgressPhoto {
  id: string
  /** YYYY-MM-DD */
  date: string
  /** Compressed JPEG data URL (kept small — localStorage is ~5MB) */
  dataUrl: string
}

/** 'weekdays' counts only Mon-Fri toward the 30-day goal; 'daily' counts all 7 days. */
export type HabitFrequency = 'weekdays' | 'daily'

export interface Habit {
  id: string
  name: string
  createdAt: string
  frequency: HabitFrequency
  /** Dates (YYYY-MM-DD) checked off. */
  completions: string[]
}
