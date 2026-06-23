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
} from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  primaryHue: 262,
  weightUnit: 'kg',
  defaultRestSeconds: 90,
  hapticEnabled: true,
  soundEnabled: true,
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

  // Template actions
  addTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => WorkoutTemplate
  updateTemplate: (id: string, data: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>) => void
  deleteTemplate: (id: string) => void

  // Session actions
  startWorkout: (template: WorkoutTemplate | null, name?: string) => WorkoutSession
  updateActiveSession: (data: Partial<WorkoutSession>) => void
  addExerciseToActiveSession: (exercise: Omit<SessionExercise, 'id' | 'order'>) => void
  completeSet: (exerciseId: string, setId: string, weight: number | undefined, reps: number | undefined) => void
  finishWorkout: (notes?: string) => WorkoutSession | null
  cancelWorkout: () => void
  updateSession: (id: string, data: Partial<WorkoutSession>) => void

  // Settings
  updateSettings: (data: Partial<AppSettings>) => void

  // Macros actions
  addFood: (food: Omit<MacroFood, 'id' | 'lastUsedAt'>) => MacroFood
  updateFood: (id: string, data: Partial<MacroFood>) => void
  deleteFood: (id: string) => void
  logMeal: (foodId: string, gramsConsumed: number) => DailyMacroLog | null
  getDayTotals: (date?: string) => { kcal: number; protein: number; carbs: number; fat: number; logs: DailyMacroLog[] }
  cleanupOldFoods: () => void

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
    sets: Array.from({ length: ex.sets }, (_, si) => ({
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
        }))

        return completedSession
      },

      cancelWorkout: () => {
        set({ activeSession: null })
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

      logMeal: (foodId, gramsConsumed) => {
        const state = get()
        const food = state.foods.find((f) => f.id === foodId)
        if (!food) return null

        const kcal = Math.round((food.kcalPer100g * gramsConsumed) / 100)
        const protein = Math.round((food.proteinPer100g * gramsConsumed) / 100 * 10) / 10
        const carbs = Math.round((food.carbsPer100g * gramsConsumed) / 100 * 10) / 10
        const fat = Math.round((food.fatPer100g * gramsConsumed) / 100 * 10) / 10

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
          timestamp: new Date().toISOString(),
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
        const state = get()
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        set((s) => ({
          foods: s.foods.filter(
            (f) => !f.lastUsedAt || f.lastUsedAt > thirtyDaysAgo
          ),
        }))
      },
    }),
    {
      name: 'pulse-store',
      skipHydration: true,
    }
  )
)
