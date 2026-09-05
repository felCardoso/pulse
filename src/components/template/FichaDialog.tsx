'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEchoStore } from '@/store/echo-store'
import type { Ficha } from '@/types'

interface Props {
  /** Omit to create a new ficha; pass an existing one to rename/edit it. */
  ficha?: Ficha
  onClose: () => void
  /** Fires with the new ficha right after creation (not called when editing). */
  onCreated?: (ficha: Ficha) => void
}

export default function FichaDialog({ ficha, onClose, onCreated }: Props) {
  const addFicha = useEchoStore((s) => s.addFicha)
  const updateFicha = useEchoStore((s) => s.updateFicha)
  const [name, setName] = useState(ficha?.name ?? '')
  const [description, setDescription] = useState(ficha?.description ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (ficha) {
      updateFicha(ficha.id, { name: trimmed, description: description.trim() || undefined })
    } else {
      const created = addFicha(trimmed, description.trim() || undefined)
      onCreated?.(created)
    }
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {ficha ? 'Renomear ficha' : 'Nova ficha'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Um programa/split com vários treinos (ex: Treino A, B, C).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ficha-name">Nome</Label>
          <Input
            id="ficha-name"
            autoFocus
            placeholder="Ex: Push Pull Legs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ficha-desc">Descrição (opcional)</Label>
          <Input
            id="ficha-desc"
            placeholder="Ex: Hipertrofia, 6x por semana"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={!name.trim()} className="flex-1">
            {ficha ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </div>,
    document.body
  )
}
