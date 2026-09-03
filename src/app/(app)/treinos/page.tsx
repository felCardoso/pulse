'use client'

import Link from 'next/link'
import { Plus, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TemplateCard from '@/components/template/TemplateCard'
import { usePulseStore } from '@/store/pulse-store'

export default function TreinosPage() {
  const templates = usePulseStore((s) => s.templates)
  const sessions = usePulseStore((s) => s.sessions)

  const getLastSession = (templateId: string) =>
    sessions.find((s) => s.templateId === templateId && s.status === 'completed')

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
        <div className="space-y-2.5">
          {templates.map((template) => {
            const last = getLastSession(template.id)
            return (
              <TemplateCard
                key={template.id}
                template={template}
                lastSessionDate={last?.startedAt}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
