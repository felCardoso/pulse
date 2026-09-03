/** YYYY-MM-DD in the browser's local timezone — never use toISOString() for
 * a "today" key, since that converts to UTC and shifts the calendar day for
 * any negative UTC-offset timezone (e.g. Brazil) in the evening. */
export function getLocalDateStr(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parses a YYYY-MM-DD date-only string as local midnight — `new Date(str)`
 * parses date-only strings as UTC midnight per spec, which silently shifts
 * the calendar day by the local UTC offset. */
export function parseLocalDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

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
  exercises: {
    unilateral?: boolean
    sets: { weight?: number; reps?: number; done: boolean; isWarmup?: boolean }[]
  }[]
): number {
  return exercises.reduce((total, ex) => {
    const multiplier = ex.unilateral ? 2 : 1
    return (
      total +
      ex.sets.reduce((setTotal, s) => {
        if (!s.done || s.weight == null || s.reps == null || s.isWarmup) return setTotal
        return setTotal + s.weight * s.reps * multiplier
      }, 0)
    )
  }, 0)
}

export function computeStreak(sessions: { startedAt: string; status: string }[]): number {
  const completed = sessions.filter((s) => s.status === 'completed')
  const dates = Array.from(
    new Set(completed.map((s) => getLocalDateStr(new Date(s.startedAt))))
  ).sort().reverse()

  let streak = 0
  let expected = new Date()
  expected.setHours(0, 0, 0, 0)

  for (const dateStr of dates) {
    const d = parseLocalDateStr(dateStr)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((expected.getTime() - d.getTime()) / 86400000)
    if (diff <= 1) {
      streak++
      expected = d
    } else {
      break
    }
  }
  return streak
}
