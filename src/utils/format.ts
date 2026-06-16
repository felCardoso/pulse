export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`
  if (m > 0) return `${m}min ${s.toString().padStart(2, '0')}s`
  return `${s}s`
}

export function formatRestTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatVolume(kg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  const value = unit === 'lbs' ? kg * 2.20462 : kg
  if (value >= 1000) return `${(value / 1000).toFixed(1)}t`
  return `${Math.round(value)}${unit}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return formatDate(iso)
}

export function formatElapsed(startedAt: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  return formatDuration(elapsed)
}

export function calcTotalVolume(
  exercises: { sets: { weight?: number; reps?: number; done: boolean }[] }[]
): number {
  return exercises.reduce((total, ex) => {
    return (
      total +
      ex.sets.reduce((setTotal, s) => {
        if (!s.done || s.weight == null || s.reps == null) return setTotal
        return setTotal + s.weight * s.reps
      }, 0)
    )
  }, 0)
}
