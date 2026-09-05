'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Folder, Pencil, Trash2, Plus } from 'lucide-react'
import TemplateCard from './TemplateCard'
import FichaDialog from './FichaDialog'
import ContextMenu from '@/components/ui/context-menu'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useEchoStore } from '@/store/echo-store'
import { getLastSessionForTemplate } from '@/utils/schedule'
import type { Ficha, WorkoutTemplate, WorkoutSession } from '@/types'

interface Props {
  ficha: Ficha
  templates: WorkoutTemplate[]
  sessions: WorkoutSession[]
}

export default function FichaSection({ ficha, templates, sessions }: Props) {
  const deleteFicha = useEchoStore((s) => s.deleteFicha)
  const [renaming, setRenaming] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-card/40 p-3">
      <ContextMenu
        items={[
          { label: 'Renomear', icon: <Pencil className="h-4 w-4" />, onSelect: () => setRenaming(true) },
          {
            label: 'Excluir ficha',
            icon: <Trash2 className="h-4 w-4" />,
            destructive: true,
            onSelect: () => setConfirmOpen(true),
          },
        ]}
      >
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Folder className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{ficha.name}</p>
            <p className="text-xs text-muted-foreground">
              {templates.length} treino{templates.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </ContextMenu>

      <div className="space-y-2">
        {templates.map((template) => {
          const last = getLastSessionForTemplate(template.id, sessions)
          return <TemplateCard key={template.id} template={template} lastSessionDate={last?.startedAt} />
        })}

        <Link
          href={`/treinos/novo?fichaId=${ficha.id}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar treino a esta ficha
        </Link>
      </div>

      {renaming && <FichaDialog ficha={ficha} onClose={() => setRenaming(false)} />}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir ficha"
        description={`Os treinos de "${ficha.name}" não serão excluídos — só deixam de fazer parte dela.`}
        onConfirm={() => {
          deleteFicha(ficha.id)
          setConfirmOpen(false)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
