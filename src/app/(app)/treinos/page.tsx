'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Play, Dumbbell, Zap, Flame, Clock, ChevronRight, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TemplateCard from '@/components/template/TemplateCard'
import SessionCard from '@/components/history/SessionCard'
import { usePulseStore } from '@/store/pulse-store'
import { calcTotalVolume, computeStreak, formatDuration } from '@/utils/format'

export default function TreinosPage() {
  const router = useRouter()
  const templates = usePulseStore((s) => s.templates)
  const sessions = usePulseStore((s) => s.sessions)
  const activeSession = usePulseStore((s) => s.activeSession)
  const startWorkout = usePulseStore((s) => s.startWorkout)
  const getSessionsThisWeek = usePulseStore((s) => s.getSessionsThisWeek)
  const personalRecords = usePulseStore((s) => s.personalRecords)
  const weeklySchedule = usePulseStore((s) => s.weeklySchedule)
  const recordCount = Object.keys(personalRecords).length

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const streak = computeStreak(completedSessions)
  const recentSessions = completedSessions.slice(0, 3)

  const weekSessions = getSessionsThisWeek()
  const weekVolume = weekSessions.reduce((acc, s) => acc + calcTotalVolume(s.exercises), 0)
  const weekTime = weekSessions.reduce((acc, s) => acc + (s.duration ?? 0), 0)

  const getLastSession = (templateId: string) =>
    completedSessions.find((s) => s.templateId === templateId)

  const handleFreeWorkout = () => {
    startWorkout(null)
    router.push('/treinos/livre/sessao')
  }

  // Today's scheduled workout takes priority; otherwise suggest the next
  // template in the cycle (the one after the most recent completed session).
  const scheduledTemplate =
    templates.find((t) => t.id === weeklySchedule[String(new Date().getDay())]) ?? null

  const suggestedTemplate = (() => {
    if (scheduledTemplate) return scheduledTemplate
    if (templates.length === 0) return null
    const lastTemplated = completedSessions.find((s) => s.templateId)
    if (!lastTemplated) return templates[0]
    const idx = templates.findIndex((t) => t.id === lastTemplated.templateId)
    if (idx === -1) return templates[0]
    return templates[(idx + 1) % templates.length]
  })()

  const handleStartSuggested = () => {
    if (!suggestedTemplate) return
    startWorkout(suggestedTemplate)
    router.push(`/treinos/${suggestedTemplate.id}/sessao`)
  }

  return (
    <div className="space-y-6">
      {/* Header with streak badge */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-foreground">Treinos</h1>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-500">{streak}</span>
          </div>
        )}
      </div>

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

      {/* Saved templates */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Meus treinos
          </h2>
          <Link href="/treinos/novo">
            <Button size="sm" variant="outline" className="h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Novo
            </Button>
          </Link>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Dumbbell className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Nenhum treino ainda</p>
              <p className="text-sm text-muted-foreground">Crie seu primeiro plano de treino</p>
            </div>
            <Link href="/treinos/novo">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Criar treino
              </Button>
            </Link>
          </div>
        ) : (
          templates.map((template) => {
            const last = getLastSession(template.id)
            return (
              <TemplateCard
                key={template.id}
                template={template}
                lastSessionDate={last?.startedAt}
              />
            )
          })
        )}
      </div>

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
