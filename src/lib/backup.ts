import type { WorkoutTemplate, WorkoutSession, PersonalRecord, AppSettings } from '@/types'

interface BackupData {
  version: number
  exportedAt: string
  templates: WorkoutTemplate[]
  sessions: WorkoutSession[]
  personalRecords: Record<string, PersonalRecord>
  settings: AppSettings
}

export function exportBackup(data: Omit<BackupData, 'version' | 'exportedAt'>) {
  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pulse-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseBackup(json: string): Omit<BackupData, 'version' | 'exportedAt'> {
  const data = JSON.parse(json) as BackupData
  if (!data.version || !Array.isArray(data.templates)) {
    throw new Error('Arquivo de backup inválido')
  }
  return {
    templates: data.templates ?? [],
    sessions: data.sessions ?? [],
    personalRecords: data.personalRecords ?? {},
    settings: data.settings ?? {},
  }
}
