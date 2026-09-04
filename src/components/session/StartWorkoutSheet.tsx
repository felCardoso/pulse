'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, Play, Zap, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEchoStore } from '@/store/echo-store'
import { getTodaySuggestion } from '@/utils/schedule'

interface Props {
  onClose: () => void
}

// Opened by the center nav button: start today's workout in one tap, or
// pick a different saved template / a free workout instead.
export default function StartWorkoutSheet({ onClose }: Props) {
  const router = useRouter()
  const templates = useEchoStore((s) => s.templates)
  const sessions = useEchoStore((s) => s.sessions)
  const weeklySchedule = useEchoStore((s) => s.weeklySchedule)
  const startWorkout = useEchoStore((s) => s.startWorkout)

  const { scheduled, suggested } = getTodaySuggestion(templates, sessions, weeklySchedule)
  const otherTemplates = templates.filter((t) => t.id !== suggested?.id)

  const handleStart = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    startWorkout(template)
    onClose()
    router.push(`/treinos/${template.id}/sessao`)
  }

  const handleFreeWorkout = () => {
    startWorkout(null)
    onClose()
    router.push('/treinos/livre/sessao')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-border bg-background px-6 pb-safe pt-6 space-y-5 animate-slide-up-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Iniciar treino</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Dumbbell className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Nenhum treino salvo ainda</p>
              <p className="text-sm text-muted-foreground">Crie um plano na aba Treinos</p>
            </div>
            <Link href="/treinos" onClick={onClose}>
              <Button className="gap-2">Ir para Treinos</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {suggested && (
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">
                  {scheduled ? 'Treino de hoje (agenda)' : 'Sugestão'}
                </p>
                <button
                  onClick={() => handleStart(suggested.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-primary/50 bg-primary/10 px-4 py-3.5 text-left transition-colors hover:bg-primary/15"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                    <Play className="h-4 w-4 fill-primary text-primary" />
                  </div>
                  <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                    {suggested.name}
                  </span>
                  <span className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    Iniciar
                  </span>
                </button>
              </div>
            )}

            {otherTemplates.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Outros treinos</p>
                <div className="space-y-1.5">
                  {otherTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleStart(t.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {t.name}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-primary">Iniciar</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleFreeWorkout}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3.5 text-left transition-colors hover:border-primary/40 hover:text-primary"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Treino Livre</p>
                <p className="text-xs text-muted-foreground">Sem template, adicione exercícios na hora</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
