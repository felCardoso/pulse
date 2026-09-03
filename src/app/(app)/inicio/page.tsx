'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, Zap, Flame, Clock, ChevronRight, Trophy, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SessionCard from '@/components/history/SessionCard'
import TrainingHeatmap from '@/components/history/TrainingHeatmap'
import MiniWeekAgenda from '@/components/history/MiniWeekAgenda'
import TodayHabitsRow from '@/components/habits/TodayHabitsRow'
import WeightChart from '@/components/progress/WeightChart'
import { useEchoStore } from '@/store/echo-store'
import { calcTotalVolume, computeStreak, formatDuration, getLocalDateStr } from '@/utils/format'
import { getTodaySuggestion } from '@/utils/schedule'
import { requestNotificationPermission, notifyWorkoutReminder } from '@/lib/notifications'

export default function InicioPage() {
  const router = useRouter()
  const templates = useEchoStore((s) => s.templates)
  const sessions = useEchoStore((s) => s.sessions)
  const activeSession = useEchoStore((s) => s.activeSession)
  const startWorkout = useEchoStore((s) => s.startWorkout)
  const getSessionsThisWeek = useEchoStore((s) => s.getSessionsThisWeek)
  const personalRecords = useEchoStore((s) => s.personalRecords)
  const weeklySchedule = useEchoStore((s) => s.weeklySchedule)
  const workoutReminders = useEchoStore((s) => s.settings.workoutReminders)
  const recordCount = Object.keys(personalRecords).length

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const streak = computeStreak(completedSessions)
  const recentSessions = completedSessions.slice(0, 3)

  const weekSessions = getSessionsThisWeek()
  const weekVolume = weekSessions.reduce((acc, s) => acc + calcTotalVolume(s.exercises), 0)
  const weekTime = weekSessions.reduce((acc, s) => acc + (s.duration ?? 0), 0)

  // Volume per session (oldest→newest of the last 12) — a quick read on
  // whether training intensity is trending up.
  const volumePoints = [...completedSessions]
    .reverse()
    .slice(-12)
    .map((s) => ({ date: getLocalDateStr(new Date(s.startedAt)), value: Math.round(calcTotalVolume(s.exercises)) }))

  const handleFreeWorkout = () => {
    startWorkout(null)
    router.push('/treinos/livre/sessao')
  }

  const { scheduled: scheduledTemplate, suggested: suggestedTemplate } = getTodaySuggestion(
    templates,
    sessions,
    weeklySchedule
  )

  const handleStartSuggested = () => {
    if (!suggestedTemplate) return
    startWorkout(suggestedTemplate)
    router.push(`/treinos/${suggestedTemplate.id}/sessao`)
  }

  // Best-effort workout reminder: fires at most once/day, only while the
  // app is open (no push server behind this, so no true background alert).
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    if (!workoutReminders || activeSession || !suggestedTemplate) return
    const today = getLocalDateStr()
    const trainedToday = completedSessions.some((s) => getLocalDateStr(new Date(s.startedAt)) === today)
    if (trainedToday) return
    notifyWorkoutReminder(suggestedTemplate.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutReminders, activeSession, suggestedTemplate?.id])

  return (
    <div className="space-y-6">
      {/* Header: streak badge + settings shortcut */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-foreground">Início</h1>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-500">{streak}</span>
            </div>
          )}
          <Link
            href="/configuracoes"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            aria-label="Configurações"
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>

      {/* Streak heatmap — purely psychological: don't break the chain */}
      {sessions.length > 0 && <TrainingHeatmap sessions={sessions} />}

      {/* Compact glance at the week's training schedule */}
      <MiniWeekAgenda />

      {/* Active workout banner */}
      {activeSession && (
        <Link
          href={
            activeSession.templateId
              ? `/treinos/${activeSession.templateId}/sessao`
              : '/treinos/livre/sessao'
          }
          className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3.5 transition-colors hover:bg-primary/15"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <Play className="h-4 w-4 fill-primary text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary text-sm">Treino em andamento</p>
            <p className="text-xs text-primary/70">{activeSession.name} — Toque para retomar</p>
          </div>
        </Link>
      )}

      {/* Next workout suggestion — start with one tap */}
      {!activeSession && suggestedTemplate && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Play className="h-4 w-4 fill-primary text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              {scheduledTemplate ? 'Treino de hoje (agenda)' : 'Próximo treino sugerido'}
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {suggestedTemplate.name}
            </p>
          </div>
          <Button size="sm" onClick={handleStartSuggested} className="shrink-0">
            Iniciar
          </Button>
        </div>
      )}

      {/* Week dashboard */}
      {weekSessions.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xl font-bold text-foreground">{weekSessions.length}</p>
            <p className="text-[11px] text-muted-foreground">treinos na semana</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xl font-bold text-foreground">{Math.round(weekVolume)}</p>
            <p className="text-[11px] text-muted-foreground">kg de volume</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xl font-bold text-foreground">
              {weekTime > 0 ? formatDuration(weekTime) : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground">tempo total</p>
          </div>
        </div>
      )}

      {/* Volume trend — intensity of recent sessions by total weight lifted */}
      {volumePoints.length > 1 && (
        <WeightChart points={volumePoints} unit="kg" title="Volume por treino (carga total levantada)" />
      )}

      {/* Quick check-in for today's routines */}
      <TodayHabitsRow />

      {/* Personal records shortcut */}
      {recordCount > 0 && (
        <Link
          href="/treinos/recordes"
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Recordes Pessoais</p>
            <p className="text-xs text-muted-foreground">
              {recordCount} exercício{recordCount !== 1 ? 's' : ''} com recorde
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      )}

      {/* Free workout */}
      {templates.length > 0 && (
        <button
          onClick={handleFreeWorkout}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3.5 text-left transition-colors hover:border-primary/40 hover:text-primary"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Treino Livre</p>
            <p className="text-xs text-muted-foreground">
              Sem template, adicione exercícios na hora
            </p>
          </div>
        </button>
      )}

      {/* Recent history */}
      {recentSessions.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Últimos treinos
            </h2>
            <Link
              href="/treinos/historico"
              className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
            >
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {/* Empty history hint */}
      {recentSessions.length === 0 && templates.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3.5 text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <p className="text-xs">Seus treinos concluídos aparecerão aqui</p>
        </div>
      )}
    </div>
  )
}
