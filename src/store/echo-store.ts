'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type {
  WorkoutTemplate,
  ExerciseTemplate,
  WorkoutSession,
  SessionExercise,
  SetLog,
  PersonalRecord,
  AppSettings,
  BodyMeasurement,
  ProgressPhoto,
  Habit,
  HabitFrequency,
} from '@/types'

/** Default auto warm-up: 60% of the working weight (40% lighter), 8 reps. */
const DEFAULT_WARMUP_PERCENT = 60
const DEFAULT_WARMUP_REPS = 8

/** Rest-Pause mode always uses a fixed short rest, regardless of the exercise's configured rest. */
const REST_PAUSE_SECONDS = 15

/** Rounds to the nearest 2.5 (plate-friendly). */
function roundWeight(w: number): number {
  return Math.max(0, Math.round(w / 2.5) * 2.5)
}

/** Rotina goal: 30 valid check-ins (weekdays-only habits skip Sat/Sun; daily habits count every day). */
export const ROUTINE_GOAL = 30

export function isWeekday(dateStr: string): boolean {
  const day = new Date(`${dateStr}T00:00:00`).getDay()
  return day !== 0 && day !== 6
}

function countsForHabit(dateStr: string, frequency: HabitFrequency): boolean {
  return frequency === 'daily' || isWeekday(dateStr)
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

const DEFAULT_SETTINGS: AppSettings = {
  primaryHue: 64,
  weightUnit: 'kg',
  defaultRestSeconds: 90,
  hapticEnabled: true,
  soundEnabled: true,
  bioimpedance: false,
  focusModeEnabled: false,
  workoutReminders: true,
  routineReminders: true,
}

interface EchoStore {
  templates: WorkoutTemplate[]
  sessions: WorkoutSession[]
  activeSession: WorkoutSession | null
  personalRecords: Record<string, PersonalRecord>
  settings: AppSettings

  // Body progress
  bodyMeasurements: BodyMeasurement[]
  weightGoalKg: number | null
  progressPhotos: ProgressPhoto[]

  // Habits / Rotinas
  habits: Habit[]

  // Weekly schedule: weekday (0=Sunday … 6=Saturday, as string) → templateId
  weeklySchedule: Record<string, string>

  // First-launch onboarding
  onboardingCompleted: boolean

  // Global rest timer — lives in the store so the countdown pill survives
  // navigation between tabs (and even an app reload, since it persists).
  rest: {
    endsAt: number
    totalSeconds: number
    /** This exercise had Rest-Pause enabled — short, silent, vibration-only end cue. */
    isRestPause?: boolean
    /** Set while paused (Focus Mode) — the frozen remaining ms, used instead of endsAt. */
    pausedRemainingMs?: number
  } | null

  // Template actions
  addTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => WorkoutTemplate
  updateTemplate: (id: string, data: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>) => void
  deleteTemplate: (id: string) => void

  // Session actions
  startWorkout: (template: WorkoutTemplate | null, name?: string) => WorkoutSession
  updateActiveSession: (data: Partial<WorkoutSession>) => void
  addExerciseToActiveSession: (exercise: Omit<SessionExercise, 'id' | 'order'>) => void
  /** Returns true when this set just set a new personal record. */
  completeSet: (exerciseId: string, setId: string, weight: number | undefined, reps: number | undefined, rir?: number) => boolean
  completeTimeExercise: (exerciseId: string, minutes: number) => void
  /** Inserts a warm-up set before the working sets, weight pre-filled from history. */
  addWarmupSet: (exerciseId: string) => void
  replaceExerciseInActiveSession: (exerciseId: string, newName: string) => void
  finishWorkout: (notes?: string) => WorkoutSession | null
  cancelWorkout: () => void
  updateSession: (id: string, data: Partial<WorkoutSession>) => void

  // Settings
  updateSettings: (data: Partial<AppSettings>) => void

  // Body progress actions
  addBodyMeasurement: (data: Omit<BodyMeasurement, 'id'>) => BodyMeasurement
  deleteBodyMeasurement: (id: string) => void
  setWeightGoal: (kg: number | null) => void
  addProgressPhoto: (dataUrl: string) => ProgressPhoto
  deleteProgressPhoto: (id: string) => void
  setWeeklySchedule: (weekday: number, templateId: string | null) => void
  completeOnboarding: () => void

  // Habit actions
  addHabit: (name: string, frequency?: HabitFrequency) => Habit
  deleteHabit: (id: string) => void
  toggleHabitToday: (id: string) => void
  getHabitProgress: (id: string) => {
    count: number
    target: number
    percentage: number
    isRoutine: boolean
    checkedToday: boolean
  }

  // Rest timer actions
  startRest: (seconds: number, isRestPause?: boolean) => void
  adjustRest: (deltaSeconds: number) => void
  stopRest: () => void
  pauseRest: () => void
  resumeRest: () => void

  // Computed
  getExerciseLibrary: () => string[]
  getLastSessionForExercise: (exerciseName: string) => { weight?: number; reps?: number } | null
  getSessionsThisWeek: () => WorkoutSession[]
}

function buildSessionExercises(exercises: ExerciseTemplate[]): SessionExercise[] {
  return exercises.map((ex, i) => ({
    id: uuid(),
    templateExerciseId: ex.id,
    name: ex.name,
    plannedSets: ex.sets,
    plannedReps: ex.reps,
    restSeconds: ex.restSeconds,
    completed: false,
    order: i,
    trackBy: ex.trackBy,
    plannedDurationMinutes: ex.trackBy === 'time' ? ex.durationMinutes ?? 20 : undefined,
    bodyweight: ex.bodyweight,
    warmupEnabled: ex.warmupEnabled,
    warmupPercent: ex.warmupPercent,
    progression: ex.progression,
    restPauseEnabled: ex.restPauseEnabled,
    // Time-based exercises log a single duration, not a set of reps.
    sets: ex.trackBy === 'time'
      ? []
      : Array.from({ length: ex.sets }, (_, si) => ({
          id: uuid(),
          setNumber: si + 1,
          weight: undefined,
          reps: undefined,
          done: false,
          doneAt: undefined,
        })),
  }))
}

/** Prepends an auto warm-up set when the exercise has it enabled. */
function withWarmup(ex: SessionExercise, lastWeight: number | undefined): SessionExercise {
  if (!ex.warmupEnabled || ex.trackBy !== 'reps') return ex
  const pct = ex.warmupPercent ?? DEFAULT_WARMUP_PERCENT
  const warmupSet: SetLog = {
    id: uuid(),
    setNumber: 0,
    weight: lastWeight != null ? roundWeight(lastWeight * (pct / 100)) : undefined,
    reps: DEFAULT_WARMUP_REPS,
    done: false,
    isWarmup: true,
  }
  return { ...ex, sets: [warmupSet, ...ex.sets] }
}

function normalizeExName(name: string) {
  return name.trim().toLowerCase()
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export const useEchoStore = create<EchoStore>()(
  persist(
    (set, get) => ({
      templates: [],
      sessions: [],
      activeSession: null,
      personalRecords: {},
      settings: DEFAULT_SETTINGS,
      bodyMeasurements: [],
      weightGoalKg: null,
      progressPhotos: [],
      habits: [],
      weeklySchedule: {},
      onboardingCompleted: false,
      rest: null,

      addTemplate: (data) => {
        const now = new Date().toISOString()
        const template: WorkoutTemplate = {
          ...data,
          id: uuid(),
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ templates: [...s.templates, template] }))
        return template
      },

      updateTemplate: (id, data) => {
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }))
      },

      startWorkout: (template, name) => {
        const now = new Date().toISOString()
        const base = template ? buildSessionExercises(template.exercises) : []
        const exercises = base.map((ex) => {
          const last = get().getLastSessionForExercise(ex.name)
          return withWarmup(ex, last?.weight)
        })
        const session: WorkoutSession = {
          id: uuid(),
          templateId: template?.id,
          name: name ?? template?.name ?? 'Treino Livre',
          date: now,
          startedAt: now,
          exercises,
          status: 'active',
        }
        set({ activeSession: session })
        return session
      },

      updateActiveSession: (data) => {
        set((s) => s.activeSession ? { activeSession: { ...s.activeSession, ...data } } : {})
      },

      addExerciseToActiveSession: (exerciseData) => {
        const state = get()
        if (!state.activeSession) return
        const order = state.activeSession.exercises.length
        const built: SessionExercise = {
          ...exerciseData,
          id: uuid(),
          order,
          sets: Array.from({ length: exerciseData.plannedSets }, (_, i) => ({
            id: uuid(),
            setNumber: i + 1,
            done: false,
          })),
        }
        const last = state.getLastSessionForExercise(built.name)
        const exercise = withWarmup(built, last?.weight)
        set((s) => ({
          activeSession: s.activeSession
            ? { ...s.activeSession, exercises: [...s.activeSession.exercises, exercise] }
            : null,
        }))
      },

      completeSet: (exerciseId, setId, weight, reps, rir) => {
        const state = get()
        if (!state.activeSession) return false

        const now = new Date().toISOString()
        let exerciseName = ''
        let isWarmupSet = false

        const updatedExercises = state.activeSession.exercises.map((ex) => {
          if (ex.id !== exerciseId) return ex
          exerciseName = ex.name
          const updatedSets = ex.sets.map((s) => {
            if (s.id !== setId) return s
            isWarmupSet = !!s.isWarmup
            return { ...s, weight, reps, rir, done: true, doneAt: now }
          })
          // Warm-up sets don't gate exercise completion — only working sets do.
          const allDone = updatedSets.filter((s) => !s.isWarmup).every((s) => s.done)
          return { ...ex, sets: updatedSets, completed: allDone }
        })

        // Update personal records — warm-up sets never count.
        let isPR = false
        const newRecords = { ...state.personalRecords }
        if (!isWarmupSet && exerciseName && weight != null && reps != null) {
          const key = normalizeExName(exerciseName)
          const volume = weight * reps
          const existing = newRecords[key]
          if (!existing || volume > existing.maxVolume || weight > existing.maxWeight) {
            isPR = true
            newRecords[key] = {
              exerciseName,
              maxWeight: Math.max(weight, existing?.maxWeight ?? 0),
              maxVolume: Math.max(volume, existing?.maxVolume ?? 0),
              achievedAt: now,
              sessionId: state.activeSession.id,
            }
          }
        }

        set((s) => ({
          activeSession: s.activeSession
            ? { ...s.activeSession, exercises: updatedExercises }
            : null,
          personalRecords: newRecords,
        }))

        return isPR
      },

      completeTimeExercise: (exerciseId, minutes) => {
        const state = get()
        if (!state.activeSession) return
        set({
          activeSession: {
            ...state.activeSession,
            exercises: state.activeSession.exercises.map((ex) =>
              ex.id === exerciseId
                ? { ...ex, actualDurationMinutes: minutes, completed: true }
                : ex
            ),
          },
        })
      },

      addWarmupSet: (exerciseId) => {
        const state = get()
        if (!state.activeSession) return
        const ex = state.activeSession.exercises.find((e) => e.id === exerciseId)
        if (!ex) return

        const doneWithWeight = [...ex.sets].reverse().find((s) => s.done && s.weight != null && !s.isWarmup)
        const baseWeight = doneWithWeight?.weight ?? state.getLastSessionForExercise(ex.name)?.weight
        const pct = ex.warmupPercent ?? DEFAULT_WARMUP_PERCENT
        const warmupSet: SetLog = {
          id: uuid(),
          setNumber: 0,
          weight: baseWeight != null ? roundWeight(baseWeight * (pct / 100)) : undefined,
          reps: DEFAULT_WARMUP_REPS,
          done: false,
          isWarmup: true,
        }

        set((s) => ({
          activeSession: s.activeSession
            ? {
                ...s.activeSession,
                exercises: s.activeSession.exercises.map((e) => {
                  if (e.id !== exerciseId) return e
                  // Goes in after any existing warm-up sets, before the first working set.
                  const firstWorkingIdx = e.sets.findIndex((st) => !st.isWarmup)
                  const insertAt = firstWorkingIdx === -1 ? e.sets.length : firstWorkingIdx
                  return {
                    ...e,
                    sets: [...e.sets.slice(0, insertAt), warmupSet, ...e.sets.slice(insertAt)],
                  }
                }),
              }
            : null,
        }))
      },

      replaceExerciseInActiveSession: (exerciseId, newName) => {
        const state = get()
        if (!state.activeSession) return
        set({
          activeSession: {
            ...state.activeSession,
            exercises: state.activeSession.exercises.map((ex) =>
              ex.id === exerciseId
                ? { ...ex, name: newName.trim(), templateExerciseId: undefined }
                : ex
            ),
          },
        })
      },

      finishWorkout: (notes) => {
        const state = get()
        if (!state.activeSession) return null

        const now = new Date().toISOString()
        const start = new Date(state.activeSession.startedAt).getTime()
        const duration = Math.round((Date.now() - start) / 1000)

        const completedSession: WorkoutSession = {
          ...state.activeSession,
          finishedAt: now,
          duration,
          notes,
          status: 'completed',
        }

        set((s) => ({
          sessions: [completedSession, ...s.sessions],
          activeSession: null,
          rest: null,
        }))

        return completedSession
      },

      cancelWorkout: () => {
        set({ activeSession: null, rest: null })
      },

      updateSession: (id, data) => {
        set((s) => ({
          sessions: s.sessions.map((session) =>
            session.id === id ? { ...session, ...data } : session
          ),
        }))
      },

      updateSettings: (data) => {
        set((s) => ({ settings: { ...s.settings, ...data } }))
      },

      getExerciseLibrary: () => {
        const state = get()
        const fromTemplates = state.templates.flatMap((t) => t.exercises.map((e) => e.name))
        const fromSessions = state.sessions.flatMap((s) => s.exercises.map((e) => e.name))
        return Array.from(new Set([...fromTemplates, ...fromSessions].map((n) => n.trim())))
          .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      },

      getLastSessionForExercise: (exerciseName) => {
        const state = get()
        const key = normalizeExName(exerciseName)
        for (const session of state.sessions) {
          const ex = session.exercises.find((e) => normalizeExName(e.name) === key)
          if (ex) {
            const lastDoneSet = [...ex.sets].reverse().find((s) => s.done && !s.isWarmup)
            if (lastDoneSet) return { weight: lastDoneSet.weight, reps: lastDoneSet.reps }
          }
        }
        return null
      },

      getSessionsThisWeek: () => {
        const state = get()
        const weekStart = startOfWeek(new Date()).getTime()
        return state.sessions.filter(
          (s) => s.status === 'completed' && new Date(s.startedAt).getTime() >= weekStart
        )
      },

      addBodyMeasurement: (data) => {
        const measurement: BodyMeasurement = { ...data, id: uuid() }
        set((s) => ({
          // Keep sorted by date ascending — charts and deltas rely on it.
          bodyMeasurements: [...s.bodyMeasurements, measurement].sort((a, b) =>
            a.date.localeCompare(b.date)
          ),
        }))
        return measurement
      },

      deleteBodyMeasurement: (id) => {
        set((s) => ({
          bodyMeasurements: s.bodyMeasurements.filter((m) => m.id !== id),
        }))
      },

      setWeightGoal: (kg) => set({ weightGoalKg: kg }),

      completeOnboarding: () => set({ onboardingCompleted: true }),

      setWeeklySchedule: (weekday, templateId) => {
        set((s) => {
          const schedule = { ...s.weeklySchedule }
          if (templateId) {
            schedule[String(weekday)] = templateId
          } else {
            delete schedule[String(weekday)]
          }
          return { weeklySchedule: schedule }
        })
      },

      addProgressPhoto: (dataUrl) => {
        const photo: ProgressPhoto = {
          id: uuid(),
          date: new Date().toISOString().split('T')[0],
          dataUrl,
        }
        set((s) => ({ progressPhotos: [...s.progressPhotos, photo] }))
        return photo
      },

      deleteProgressPhoto: (id) => {
        set((s) => ({ progressPhotos: s.progressPhotos.filter((p) => p.id !== id) }))
      },

      addHabit: (name, frequency = 'weekdays') => {
        const habit: Habit = {
          id: uuid(),
          name: name.trim(),
          createdAt: new Date().toISOString(),
          frequency,
          completions: [],
        }
        set((s) => ({ habits: [...s.habits, habit] }))
        return habit
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
      },

      toggleHabitToday: (id) => {
        const today = todayStr()
        const habit = get().habits.find((h) => h.id === id)
        if (!habit || !countsForHabit(today, habit.frequency)) return
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h
            const checked = h.completions.includes(today)
            return {
              ...h,
              completions: checked
                ? h.completions.filter((d) => d !== today)
                : [...h.completions, today],
            }
          }),
        }))
      },

      getHabitProgress: (id) => {
        const habit = get().habits.find((h) => h.id === id)
        const count = habit
          ? habit.completions.filter((d) => countsForHabit(d, habit.frequency)).length
          : 0
        return {
          count,
          target: ROUTINE_GOAL,
          percentage: Math.min(100, (count / ROUTINE_GOAL) * 100),
          isRoutine: count >= ROUTINE_GOAL,
          checkedToday: habit ? habit.completions.includes(todayStr()) : false,
        }
      },

      startRest: (seconds, isRestPause) => {
        const effective = isRestPause ? REST_PAUSE_SECONDS : seconds
        if (effective <= 0) return
        set({ rest: { endsAt: Date.now() + effective * 1000, totalSeconds: effective, isRestPause } })
      },

      adjustRest: (deltaSeconds) => {
        set((s) => {
          if (!s.rest) return {}
          // Paused (Focus Mode): adjust the frozen remaining time directly.
          if (s.rest.pausedRemainingMs != null) {
            return {
              rest: {
                ...s.rest,
                pausedRemainingMs: Math.max(1000, s.rest.pausedRemainingMs + deltaSeconds * 1000),
              },
            }
          }
          return {
            rest: {
              ...s.rest,
              // Never adjust below ~1s so the countdown always ends naturally
              // (with the end-of-rest feedback) instead of jumping negative.
              endsAt: Math.max(Date.now() + 1000, s.rest.endsAt + deltaSeconds * 1000),
              totalSeconds: Math.max(1, s.rest.totalSeconds + deltaSeconds),
            },
          }
        })
      },

      stopRest: () => set({ rest: null }),

      pauseRest: () => {
        set((s) => {
          if (!s.rest || s.rest.pausedRemainingMs != null) return {}
          return { rest: { ...s.rest, pausedRemainingMs: Math.max(0, s.rest.endsAt - Date.now()) } }
        })
      },

      resumeRest: () => {
        set((s) => {
          if (!s.rest || s.rest.pausedRemainingMs == null) return {}
          return {
            rest: {
              ...s.rest,
              endsAt: Date.now() + s.rest.pausedRemainingMs,
              pausedRemainingMs: undefined,
            },
          }
        })
      },
    }),
    {
      name: 'echo-store',
      skipHydration: true,
    }
  )
)
