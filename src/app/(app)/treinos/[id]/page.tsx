'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Play, Pencil, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import { formatRelativeDate } from '@/utils/format'

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const templates = usePulseStore((s) => s.templates)
  const sessions = usePulseStore((s) => s.sessions)
  const startWorkout = usePulseStore((s) => s.startWorkout)
  const activeSession = usePulseStore((s) => s.activeSession)

  const template = templates.find((t) => t.id === id)

  if (!template) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <p>Treino não encontrado.</p>
        <Link href="/treinos" className="mt-4 inline-block text-primary text-sm">
          Voltar
        </Link>
      </div>
    )
  }

  const lastSessions = sessions
    .filter((s) => s.templateId === id && s.status === 'completed')
    .slice(0, 3)

  const handleStart = () => {
    if (activeSession && activeSession.templateId === id) {
      router.push(`/treinos/${id}/sessao`)
      return
    }
    startWorkout(template)
    router.push(`/treinos/${id}/sessao`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link href="/treinos" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-foreground truncate">{template.name}</h1>
        </div>
        <Link href={`/treinos/${id}/editar`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {template.description && (
        <p className="text-sm text-muted-foreground">{template.description}</p>
      )}

      {/* Exercise list */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {template.exercises.length} Exercício{template.exercises.length !== 1 ? 's' : ''}
        </h2>
        {template.exercises.map((ex, i) => (
          <div
            key={ex.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{ex.name}</p>
              <p className="text-xs text-muted-foreground">
                {ex.sets}x{ex.reps} · {ex.restSeconds >= 60 ? `${Math.floor(ex.restSeconds / 60)}min` : `${ex.restSeconds}s`} descanso
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Últimas sessões */}
      {lastSessions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Últimas sessões
          </h2>
          {lastSessions.map((s) => (
            <Link
              key={s.id}
              href={`/historico/${s.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/30 transition-colors"
            >
              <Dumbbell className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm">{formatRelativeDate(s.startedAt)}</span>
              <span className="text-xs text-muted-foreground">
                {s.exercises.length} ex.
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="pb-4">
        <Button onClick={handleStart} className="w-full gap-2" size="lg">
          <Play className="h-4 w-4 fill-current" />
          {activeSession?.templateId === id ? 'Retomar Treino' : 'Iniciar Treino'}
        </Button>
      </div>
    </div>
  )
}
