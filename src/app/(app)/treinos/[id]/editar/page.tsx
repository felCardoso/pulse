'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import TemplateForm from '@/components/template/TemplateForm'
import { usePulseStore } from '@/store/pulse-store'

export default function EditarTreinoPage() {
  const { id } = useParams<{ id: string }>()
  const templates = usePulseStore((s) => s.templates)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pt-2">
        <Link href={`/treinos/${id}`} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Editar Treino</h1>
      </div>
      <TemplateForm existing={template} />
    </div>
  )
}
