'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useEchoStore } from '@/store/echo-store'
import type { HabitFrequency } from '@/types'

interface Props {
  onClose: () => void
}

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string; description: string }[] = [
  { value: 'weekdays', label: 'Dias úteis', description: 'Seg a sex. Fim de semana não conta.' },
  { value: 'daily', label: 'Todos os dias', description: 'Inclui sábado e domingo.' },
]

export default function AddHabitDialog({ onClose }: Props) {
  const addHabit = useEchoStore((s) => s.addHabit)
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('weekdays')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addHabit(trimmed, frequency)
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
            30 check-ins válidos para virar hábito.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="habit-name">Nome</Label>
          <Input
            id="habit-name"
            autoFocus
            placeholder="Ex: Meditar, Creatina, Ler 10 páginas..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label>Frequência</Label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFrequency(opt.value)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-left transition-colors',
                  frequency === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <p className="text-sm font-medium text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>
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
