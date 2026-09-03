'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePulseStore } from '@/store/pulse-store'

interface Props {
  onClose: () => void
}

export default function AddHabitDialog({ onClose }: Props) {
  const addHabit = usePulseStore((s) => s.addHabit)
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addHabit(trimmed)
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-semibold text-foreground">Nova rotina</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Marque de segunda a sexta. Fins de semana não contam para a meta de 30 dias.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="habit-name">Nome</Label>
          <Input
            id="habit-name"
            autoFocus
            placeholder="Ex: Meditar, Ler 10 páginas..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={!name.trim()} className="flex-1">
            Criar
          </Button>
        </div>
      </form>
    </div>,
    document.body
  )
}
