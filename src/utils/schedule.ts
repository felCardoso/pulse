import type { WorkoutTemplate, WorkoutSession } from '@/types'

export interface TodaySuggestion {
  /** Explicitly assigned to today via the weekly schedule. */
  scheduled: WorkoutTemplate | null
  /** scheduled, or the next template in rotation when there's no schedule. */
  suggested: WorkoutTemplate | null
}

/** Today's scheduled workout takes priority; otherwise suggest the next
 *  template in the cycle (the one after the most recent completed session). */
export function getTodaySuggestion(
  templates: WorkoutTemplate[],
  sessions: WorkoutSession[],
  weeklySchedule: Record<string, string>
): TodaySuggestion {
  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const scheduled =
    templates.find((t) => t.id === weeklySchedule[String(new Date().getDay())]) ?? null

  const suggested = (() => {
    if (scheduled) return scheduled
    if (templates.length === 0) return null
    const lastTemplated = completedSessions.find((s) => s.templateId)
    if (!lastTemplated) return templates[0]
    const idx = templates.findIndex((t) => t.id === lastTemplated.templateId)
    if (idx === -1) return templates[0]
    return templates[(idx + 1) % templates.length]
  })()

  return { scheduled, suggested }
}
