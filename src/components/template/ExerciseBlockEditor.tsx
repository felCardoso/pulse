'use client'

import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ExerciseTemplate } from '@/types'

const REST_PRESETS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2min', value: 120 },
  { label: '3min', value: 180 },
]

interface Props {
  exercise: Omit<ExerciseTemplate, 'id'>
  index: number
  total: number
  libraryId: string
  onChange: (data: Partial<Omit<ExerciseTemplate, 'id'>>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export default function ExerciseBlockEditor({
  exercise,
  index,
  total,
  libraryId,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
          {index + 1}
        </span>
        <div className="flex-1">
          <Input
            placeholder="Nome do exercício"
            value={exercise.name}
            list={libraryId}
            onChange={(e) => onChange({ name: e.target.value })}
            className="border-0 bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-muted-foreground disabled:opacity-30 hover:text-foreground"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 text-muted-foreground disabled:opacity-30 hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Séries</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            value={exercise.sets}
            onChange={(e) => onChange({ sets: parseInt(e.target.value) || 1 })}
            className="h-9 text-center"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Reps</Label>
          <Input
            placeholder="10 ou 8-12"
            value={exercise.reps}
            onChange={(e) => onChange({ reps: e.target.value })}
            className="h-9 text-center"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Descanso</Label>
        <div className="flex flex-wrap gap-1.5">
          {REST_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange({ restSeconds: p.value })}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                exercise.restSeconds === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={exercise.restSeconds}
              onChange={(e) => onChange({ restSeconds: parseInt(e.target.value) || 0 })}
              className="h-7 w-16 text-center text-xs"
            />
            <span className="text-xs text-muted-foreground">s</span>
          </div>
        </div>
      </div>

      {exercise.notes !== undefined && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Observação</Label>
          <Input
            placeholder="Ex: foco na contração"
            value={exercise.notes ?? ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange({ notes: exercise.notes === undefined ? '' : undefined })}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        {exercise.notes === undefined ? '+ Adicionar observação' : '- Remover observação'}
      </button>
    </div>
  )
}
