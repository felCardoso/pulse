'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Dumbbell, ChevronRight, Trash2, Pencil } from 'lucide-react'
import { usePulseStore } from '@/store/pulse-store'
import { formatRelativeDate } from '@/utils/format'
import ContextMenu from '@/components/ui/context-menu'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import type { WorkoutTemplate } from '@/types'

interface Props {
  template: WorkoutTemplate
  lastSessionDate?: string
}

export default function TemplateCard({ template, lastSessionDate }: Props) {
  const router = useRouter()
  const deleteTemplate = usePulseStore((s) => s.deleteTemplate)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <ContextMenu
        items={[
          {
            label: 'Editar',
            icon: <Pencil className="h-4 w-4" />,
            onSelect: () => router.push(`/treinos/${template.id}/editar`),
          },
          {
            label: 'Excluir',
            icon: <Trash2 className="h-4 w-4" />,
            destructive: true,
            onSelect: () => setConfirmOpen(true),
          },
        ]}
      >
        <Link
          href={`/treinos/${template.id}`}
          className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40 active:bg-card/80"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{template.name}</p>
            <p className="text-xs text-muted-foreground">
              {template.exercises.length} exercício{template.exercises.length !== 1 ? 's' : ''}
              {lastSessionDate ? ` · ${formatRelativeDate(lastSessionDate)}` : ' · Nunca feito'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                setConfirmOpen(true)
              }}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      </ContextMenu>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir treino"
        description={`Tem certeza que deseja excluir "${template.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          deleteTemplate(template.id)
          setConfirmOpen(false)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
