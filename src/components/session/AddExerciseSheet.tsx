'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePulseStore } from '@/store/pulse-store'
import type { SessionExercise } from '@/types'

interface Props {
  onAdd: (exercise: Omit<SessionExercise, 'id' | 'order'>) => void
  onClose: () => void
}

export default function AddExerciseSheet({ onAdd, onClose }: Props) {
  const getExerciseLibrary = usePulseStore((s) => s.getExerciseLibrary)
  const [name, setName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [rest, setRest] = useState('90')

  const library = getExerciseLibrary()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const plannedSets = parseInt(sets) || 3
    onAdd({
      templateExerciseId: undefined,
      name: name.trim(),
      plannedSets,
      plannedReps: reps || '10',
      restSeconds: parseInt(rest) || 90,
      completed: false,
      sets: Array.from({ length: plannedSets }, (_, i) => ({
        id: uuid(),
        setNumber: i + 1,
        done: false,
      })),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl border-t border-border bg-background px-6 pb-safe pt-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Adicionar exercício</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <datalist id="add-ex-library">
          {library.map((ex) => <option key={ex} value={ex} />)}
        </datalist>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={name}
              list="add-ex-library"
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do exercício"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Séries</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="text-center"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reps</Label>
              <Input
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="text-center"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descanso(s)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={rest}
                onChange={(e) => setRest(e.target.value)}
                className="text-center"
              />
            </div>
          </div>
          <Button type="submit" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </form>
      </div>
    </div>
  )
}
