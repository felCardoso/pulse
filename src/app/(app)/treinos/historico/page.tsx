'use client'

import Link from 'next/link'
import { Flame, Clock, ChevronLeft } from 'lucide-react'
import SessionCard from '@/components/history/SessionCard'
import { useEchoStore } from '@/store/echo-store'
import { formatRelativeDate, computeStreak } from '@/utils/format'

export default function HistoricoPage() {
  const allSessions = useEchoStore((s) => s.sessions)
  const sessions = allSessions.filter((s) => s.status === 'completed')
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
        <div className="flex items-center gap-2">
          <Link href="/inicio" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Histórico de Treinos</h1>
        </div>
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
