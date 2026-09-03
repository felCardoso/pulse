import type {
  WorkoutTemplate,
  WorkoutSession,
  PersonalRecord,
  AppSettings,
  MacroFood,
  DailyMacroLog,
  MacroTargets,
  BodyMeasurement,
  ProgressPhoto,
  Habit,
} from '@/types'

interface BackupData {
  version: number
  exportedAt: string
  templates: WorkoutTemplate[]
  sessions: WorkoutSession[]
  personalRecords: Record<string, PersonalRecord>
  settings: AppSettings
  // v2 fields (optional so v1 backups still import)
  foods?: MacroFood[]
  dailyMacroLogs?: DailyMacroLog[]
  macroTargets?: MacroTargets
  bodyMeasurements?: BodyMeasurement[]
  weightGoalKg?: number | null
  progressPhotos?: ProgressPhoto[]
  weeklySchedule?: Record<string, string>
  habits?: Habit[]
}

export type BackupPayload = Omit<BackupData, 'version' | 'exportedAt'>

export function exportBackup(data: BackupPayload) {
  const backup: BackupData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    ...data,
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `loop-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseBackup(json: string): BackupPayload {
  const data = JSON.parse(json) as BackupData
  if (!data.version || !Array.isArray(data.templates)) {
    throw new Error('Arquivo de backup inválido')
  }
  return {
    templates: data.templates ?? [],
    sessions: data.sessions ?? [],
    personalRecords: data.personalRecords ?? {},
    settings: data.settings ?? {},
    foods: data.foods ?? [],
    dailyMacroLogs: data.dailyMacroLogs ?? [],
    macroTargets: data.macroTargets,
    bodyMeasurements: data.bodyMeasurements ?? [],
    weightGoalKg: data.weightGoalKg ?? null,
    progressPhotos: data.progressPhotos ?? [],
    weeklySchedule: data.weeklySchedule ?? {},
    habits: data.habits ?? [],
  }
}
