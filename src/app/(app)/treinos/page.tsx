'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Play, Dumbbell, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TemplateCard from '@/components/template/TemplateCard'
import { usePulseStore } from '@/store/pulse-store'
import { calcTotalVolume } from '@/utils/format'

export default function TreinosPage() {
  const router = useRouter()
  const templates = usePulseStore((s) => s.templates)
  const sessions = usePulseStore((s) => s.sessions)
  const activeSession = usePulseStore((s) => s.activeSession)
  const startWorkout = usePulseStore((s) => s.startWorkout)
  const getSessionsThisWeek = usePulseStore((s) => s.getSessionsThisWeek)

  const weekSessions = getSessionsThisWeek()
  const weekVolume = weekSessions.reduce((acc, s) => acc + calcTotalVolume(s.exercises), 0)

  const getLastSession = (templateId: string) =>
    sessions.find((s) => s.templateId === templateId && s.status === 'completed')

  const handleFreeWorkout = () => {
    startWorkout(null)
    router.push('/treinos/livre/sessao')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-foreground">Treinos</h1>
        <Link href="/treinos/novo">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </Link>
      </div>

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

      {weekSessions.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-3.5">
            <p className="text-2xl font-bold text-foreground">{weekSessions.length}</p>
            <p className="text-xs text-muted-foreground">treinos esta semana</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5">
            <p className="text-2xl font-bold text-foreground">{Math.round(weekVolume)}</p>
            <p className="text-xs text-muted-foreground">kg de volume total</p>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
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
    </div>
  )
}
