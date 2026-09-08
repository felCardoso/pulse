'use client'

import { createPortal } from 'react-dom'
import { Dumbbell, Plus } from 'lucide-react'
import { useEchoStore } from '@/store/echo-store'
import type { Ficha } from '@/types'

interface Props {
  ficha: Ficha
  onClose: () => void
}

/** Lets an already-created (avulso) workout be pulled into this ficha,
 * instead of only being able to create a brand-new one directly inside it. */
export default function AddExistingTemplateDialog({ ficha, onClose }: Props) {
  const templates = useEchoStore((s) => s.templates)
  const updateTemplate = useEchoStore((s) => s.updateTemplate)

  const avulsos = templates.filter((t) => !t.fichaId)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative flex max-h-[75vh] w-full max-w-sm flex-col rounded-2xl border border-border bg-card p-5 shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Adicionar treino existente</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha um treino avulso para adicionar a &quot;{ficha.name}&quot;.
          </p>
        </div>

        {avulsos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum treino avulso disponível — todos os seus treinos já estão em uma ficha.
          </p>
        ) : (
          <div className="-mx-1 flex-1 space-y-2 overflow-y-auto px-1">
            {avulsos.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => updateTemplate(template.id, { fichaId: ficha.id })}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-3 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {template.exercises.length} exercício{template.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Plus className="h-4 w-4 shrink-0 text-primary" />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-secondary py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Concluído
        </button>
      </div>
    </div>,
    document.body
  )
}
