'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Dumbbell, CalendarDays, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TemplateCard from '@/components/template/TemplateCard'
import FichaSection from '@/components/template/FichaSection'
import FichaDialog from '@/components/template/FichaDialog'
import WeeklyScheduleCard from '@/components/template/WeeklyScheduleCard'
import { useEchoStore } from '@/store/echo-store'
import { getLastSessionForTemplate } from '@/utils/schedule'

export default function TreinosPage() {
  const templates = useEchoStore((s) => s.templates)
  const fichas = useEchoStore((s) => s.fichas)
  const sessions = useEchoStore((s) => s.sessions)
  const [creatingFicha, setCreatingFicha] = useState(false)

  const avulsos = templates.filter((t) => !t.fichaId)

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

      {/* Organize by day: tap a day to assign a saved workout, or rest */}
      <div className="space-y-2.5">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          Agenda da semana
        </h2>
        <WeeklyScheduleCard />
      </div>

      {/* Fichas: programs/splits grouping several workouts */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Fichas
          </h2>
          <button
            type="button"
            onClick={() => setCreatingFicha(true)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            Nova ficha
          </button>
        </div>

        {fichas.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Agrupe vários treinos (ex: Treino A, B, C) em uma ficha para organizar seu programa.
          </p>
        ) : (
          <div className="space-y-2.5">
            {fichas.map((ficha) => (
              <FichaSection
                key={ficha.id}
                ficha={ficha}
                templates={templates.filter((t) => t.fichaId === ficha.id)}
                sessions={sessions}
              />
            ))}
          </div>
        )}
      </div>

      {/* Saved templates without a ficha */}
      <div className="space-y-2.5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {fichas.length > 0 ? 'Treinos avulsos' : 'Meus treinos'}
        </h2>

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
        ) : avulsos.length === 0 ? (
          <p className="text-xs text-muted-foreground">Todos os seus treinos estão em uma ficha.</p>
        ) : (
          <div className="space-y-2.5">
            {avulsos.map((template) => {
              const last = getLastSessionForTemplate(template.id, sessions)
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

      {creatingFicha && <FichaDialog onClose={() => setCreatingFicha(false)} />}
    </div>
  )
}
