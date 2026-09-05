import type { WorkoutTemplate, WorkoutSession } from '@/types'

/** Most recent completed session for a template, if any — used to show "last done" on template cards. */
export function getLastSessionForTemplate(
  templateId: string,
  sessions: WorkoutSession[]
): WorkoutSession | undefined {
  return sessions.find((s) => s.templateId === templateId && s.status === 'completed')
}

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
    const lastTemplate = templates.find((t) => t.id === lastTemplated.templateId)
    if (!lastTemplate) return templates[0]

    // Rotate only within the same group: the last workout's ficha (if any),
    // or the ungrouped ("avulso") templates otherwise — so following one
    // program's cycle doesn't get interrupted by unrelated templates from
    // a different ficha.
    const group = templates.filter((t) => (t.fichaId ?? null) === (lastTemplate.fichaId ?? null))
    const idx = group.findIndex((t) => t.id === lastTemplate.id)
    if (idx === -1) return templates[0]
    return group[(idx + 1) % group.length]
  })()

  return { scheduled, suggested }
}
