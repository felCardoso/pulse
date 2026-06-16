'use client'

import { Flame, Clock } from 'lucide-react'
import SessionCard from '@/components/history/SessionCard'
import { usePulseStore } from '@/store/pulse-store'
import { formatRelativeDate } from '@/utils/format'

function computeStreak(sessions: { startedAt: string; status: string }[]): number {
  const completed = sessions.filter((s) => s.status === 'completed')
  const dates = Array.from(
    new Set(completed.map((s) => s.startedAt.split('T')[0]))
  ).sort().reverse()

  let streak = 0
  let expected = new Date()
  expected.setHours(0, 0, 0, 0)

  for (const dateStr of dates) {
    const d = new Date(dateStr)
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

export default function HistoricoPage() {
  const sessions = usePulseStore((s) => s.sessions.filter((s) => s.status === 'completed'))
  const streak = computeStreak(sessions)

  // Group sessions by relative date
  const groups = sessions.reduce<Record<string, typeof sessions>>((acc, session) => {
    const label = formatRelativeDate(session.startedAt)
    if (!acc[label]) acc[label] = []
    acc[label].push(session)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-500">{streak}</span>
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Clock className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhum treino concluído</p>
            <p className="text-sm text-muted-foreground">
              Seus treinos aparecerão aqui após serem finalizados
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([label, group]) => (
            <div key={label} className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </h2>
              {group.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
