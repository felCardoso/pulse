'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Dumbbell, Trophy } from 'lucide-react'
import { useEchoStore } from '@/store/echo-store'
import WeightChart from '@/components/progress/WeightChart'
import { formatRelativeDate, getLocalDateStr } from '@/utils/format'

export default function ExercicioEvolucaoPage() {
  const params = useParams<{ name: string }>()
  const exerciseName = decodeURIComponent(params.name)
  const norm = exerciseName.trim().toLowerCase()

  const sessions = useEchoStore((s) => s.sessions)
  const personalRecords = useEchoStore((s) => s.personalRecords)
  const weightUnit = useEchoStore((s) => s.settings.weightUnit)

  const pr = personalRecords[norm]

  // Every completed session containing this exercise, oldest first.
  const history = sessions
    .filter((s) => s.status === 'completed')
    .map((session) => {
      const ex = session.exercises.find(
        (e) => e.trackBy === 'reps' && e.name.trim().toLowerCase() === norm
      )
      if (!ex) return null
      const doneSets = ex.sets.filter((s) => s.done && s.weight != null && !s.isWarmup)
      if (doneSets.length === 0) return null
      const maxWeight = Math.max(...doneSets.map((s) => s.weight as number))
      const volume = doneSets.reduce(
        (acc, s) => acc + (s.weight as number) * (s.reps ?? 0),
        0
      )
      return {
        sessionId: session.id,
        date: getLocalDateStr(new Date(session.startedAt)),
        startedAt: session.startedAt,
        maxWeight,
        volume: Math.round(volume),
        setsSummary: doneSets.map((s) => `${s.weight}×${s.reps}`).join(' · '),
      }
    })
    .filter(Boolean)
    .reverse() as {
    sessionId: string
    date: string
    startedAt: string
    maxWeight: number
    volume: number
    setsSummary: string
  }[]

  const weightPoints = history.slice(-12).map((h) => ({ date: h.date, value: h.maxWeight }))
  const volumePoints = history.slice(-12).map((h) => ({ date: h.date, value: h.volume }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pt-2">
        <Link href="/treinos/recordes" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold text-foreground">
          {exerciseName}
        </h1>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Dumbbell className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground px-8">
            Nenhum registro com carga para este exercício ainda
          </p>
        </div>
      ) : (
        <>
          {/* PR summary */}
          {pr && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
              <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-500 tabular-nums">
                Recorde: <span className="font-semibold">{pr.maxWeight}{weightUnit}</span>
                {' · '}volume máx {Math.round(pr.maxVolume)}{weightUnit}
              </p>
            </div>
          )}

          {/* Charts */}
          {weightPoints.length > 1 && (
            <WeightChart points={weightPoints} unit={weightUnit} title="Carga máxima por sessão" />
          )}
          {volumePoints.length > 1 && (
            <WeightChart points={volumePoints} unit={weightUnit} title="Volume por sessão" />
          )}

          {/* Session-by-session history */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Sessões ({history.length})
            </h2>
            {[...history].reverse().map((h) => (
              <Link
                key={h.sessionId}
                href={`/treinos/historico/${h.sessionId}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground tabular-nums">
                    {h.maxWeight}{weightUnit} máx · {h.volume}{weightUnit} volume
                  </p>
                  <p className="truncate text-xs text-muted-foreground tabular-nums">
                    {h.setsSummary}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeDate(h.startedAt)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
