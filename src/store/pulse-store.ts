'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type {
  WorkoutTemplate,
  ExerciseTemplate,
  WorkoutSession,
  SessionExercise,
  PersonalRecord,
  AppSettings,
  MacroFood,
  DailyMacroLog,
  MacroTargets,
  BodyMeasurement,
  ProgressPhoto,
  Habit,
  HabitFrequency,
} from '@/types'

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
}

interface PulseStore {
  templates: WorkoutTemplate[]
  sessions: WorkoutSession[]
  activeSession: WorkoutSession | null
  personalRecords: Record<string, PersonalRecord>
  settings: AppSettings

  // Macros
  foods: MacroFood[]
  dailyMacroLogs: DailyMacroLog[]
  macroTargets: MacroTargets

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
  rest: { endsAt: number; totalSeconds: number } | null

  // Template actions
  addTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => WorkoutTemplate
  updateTemplate: (id: string, data: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>) => void
  deleteTemplate: (id: string) => void

  // Session actions
  startWorkout: (template: WorkoutTemplate | null, name?: string) => WorkoutSession
  updateActiveSession: (data: Partial<WorkoutSession>) => void
  addExerciseToActiveSession: (exercise: Omit<SessionExercise, 'id' | 'order'>) => void
  completeSet: (exerciseId: string, setId: string, weight: number | undefined, reps: number | undefined) => void
  completeCardioExercise: (exerciseId: string, minutes: number) => void
  replaceExerciseInActiveSession: (exerciseId: string, newName: string) => void
  finishWorkout: (notes?: string) => WorkoutSession | null
  cancelWorkout: () => void
  updateSession: (id: string, data: Partial<WorkoutSession>) => void

  // Settings
  updateSettings: (data: Partial<AppSettings>) => void

  // Macros actions
  addFood: (food: Omit<MacroFood, 'id' | 'lastUsedAt'>) => MacroFood
  updateFood: (id: string, data: Partial<MacroFood>) => void
  deleteFood: (id: string) => void
  logMeal: (foodId: string, gramsConsumed: number, time?: string) => DailyMacroLog | null
  getDayTotals: (date?: string) => { kcal: number; protein: number; carbs: number; fat: number; logs: DailyMacroLog[] }
  cleanupOldFoods: () => void
  updateMacroTargets: (data: Partial<MacroTargets>) => void

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
  startRest: (seconds: number) => void
  adjustRest: (deltaSeconds: number) => void
  stopRest: () => void

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
    isCardio: ex.isCardio,
    plannedDurationMinutes: ex.isCardio ? ex.durationMinutes ?? 20 : undefined,
    // Cardio tracks time, not sets.
    sets: ex.isCardio
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

export const usePulseStore = create<PulseStore>()(
  persist(
    (set, get) => ({
      templates: [],
      sessions: [],
      activeSession: null,
      personalRecords: {},
      settings: DEFAULT_SETTINGS,
      foods: [],
      dailyMacroLogs: [],
      macroTargets: { kcal: 2900, protein: 230, carbs: 290, fat: 97 },
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
        const session: WorkoutSession = {
          id: uuid(),
          templateId: template?.id,
          name: name ?? template?.name ?? 'Treino Livre',
          date: now,
          startedAt: now,
          exercises: template ? buildSessionExercises(template.exercises) : [],
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
        const exercise: SessionExercise = {
          ...exerciseData,
          id: uuid(),
          order,
          sets: Array.from({ length: exerciseData.plannedSets }, (_, i) => ({
            id: uuid(),
            setNumber: i + 1,
            done: false,
          })),
        }
        set((s) => ({
          activeSession: s.activeSession
            ? { ...s.activeSession, exercises: [...s.activeSession.exercises, exercise] }
            : null,
        }))
      },

      completeSet: (exerciseId, setId, weight, reps) => {
        const state = get()
        if (!state.activeSession) return

        const now = new Date().toISOString()
        let exerciseName = ''

        const updatedExercises = state.activeSession.exercises.map((ex) => {
          if (ex.id !== exerciseId) return ex
          exerciseName = ex.name
          const updatedSets = ex.sets.map((s) =>
            s.id === setId ? { ...s, weight, reps, done: true, doneAt: now } : s
          )
          const allDone = updatedSets.every((s) => s.done)
          return { ...ex, sets: updatedSets, completed: allDone }
        })

        // Update personal records
        const newRecords = { ...state.personalRecords }
        if (exerciseName && weight != null && reps != null) {
          const key = normalizeExName(exerciseName)
          const volume = weight * reps
          const existing = newRecords[key]
          if (!existing || volume > existing.maxVolume || weight > existing.maxWeight) {
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
      },

      completeCardioExercise: (exerciseId, minutes) => {
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
            const lastDoneSet = [...ex.sets].reverse().find((s) => s.done)
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

      addFood: (data) => {
        const food: MacroFood = {
          ...data,
          id: uuid(),
        }
        set((s) => ({ foods: [...s.foods, food] }))
        return food
      },

      updateFood: (id, data) => {
        set((s) => ({
          foods: s.foods.map((f) =>
            f.id === id ? { ...f, ...data, lastUsedAt: f.lastUsedAt } : f
          ),
        }))
      },

      deleteFood: (id) => {
        set((s) => ({ foods: s.foods.filter((f) => f.id !== id) }))
      },

      logMeal: (foodId, gramsConsumed, time) => {
        const state = get()
        const food = state.foods.find((f) => f.id === foodId)
        if (!food) return null

        const kcal = Math.round((food.kcalPer100g * gramsConsumed) / 100)
        const protein = Math.round((food.proteinPer100g * gramsConsumed) / 100 * 10) / 10
        const carbs = Math.round((food.carbsPer100g * gramsConsumed) / 100 * 10) / 10
        const fat = Math.round((food.fatPer100g * gramsConsumed) / 100 * 10) / 10

        // Optional "HH:MM" sets the meal's time (today's date is kept).
        const when = new Date()
        if (time) {
          const [h, m] = time.split(':').map(Number)
          if (Number.isFinite(h) && Number.isFinite(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
            when.setHours(h, m, 0, 0)
          }
        }

        const log: DailyMacroLog = {
          id: uuid(),
          date: new Date().toISOString().split('T')[0],
          foodId,
          foodName: food.name,
          gramsConsumed,
          kcal,
          protein,
          carbs,
          fat,
          timestamp: when.toISOString(),
        }

        set((s) => ({
          dailyMacroLogs: [...s.dailyMacroLogs, log],
          foods: s.foods.map((f) =>
            f.id === foodId ? { ...f, lastUsedAt: new Date().toISOString() } : f
          ),
        }))

        return log
      },

      getDayTotals: (date) => {
        const state = get()
        const targetDate = date || new Date().toISOString().split('T')[0]
        const logs = state.dailyMacroLogs.filter((l) => l.date === targetDate)

        return {
          kcal: logs.reduce((acc, l) => acc + l.kcal, 0),
          protein: Math.round(logs.reduce((acc, l) => acc + l.protein, 0) * 10) / 10,
          carbs: Math.round(logs.reduce((acc, l) => acc + l.carbs, 0) * 10) / 10,
          fat: Math.round(logs.reduce((acc, l) => acc + l.fat, 0) * 10) / 10,
          logs,
        }
      },

      cleanupOldFoods: () => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        set((s) => ({
          foods: s.foods.filter(
            (f) => !f.lastUsedAt || f.lastUsedAt > thirtyDaysAgo
          ),
        }))
      },

      updateMacroTargets: (data) => {
        set((s) => ({ macroTargets: { ...s.macroTargets, ...data } }))
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

      startRest: (seconds) => {
        set({ rest: { endsAt: Date.now() + seconds * 1000, totalSeconds: seconds } })
      },

      adjustRest: (deltaSeconds) => {
        set((s) => {
          if (!s.rest) return {}
          return {
            rest: {
              // Never adjust below ~1s so the countdown always ends naturally
              // (with the end-of-rest feedback) instead of jumping negative.
              endsAt: Math.max(Date.now() + 1000, s.rest.endsAt + deltaSeconds * 1000),
              totalSeconds: Math.max(1, s.rest.totalSeconds + deltaSeconds),
            },
          }
        })
      },

      stopRest: () => set({ rest: null }),
    }),
    {
      name: 'pulse-store',
      skipHydration: true,
    }
  )
)
