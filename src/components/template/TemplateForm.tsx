'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Repeat } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ExerciseBlockEditor from './ExerciseBlockEditor'
import CSVImport from './CSVImport'
import { useEchoStore } from '@/store/echo-store'
import type { ExerciseTemplate, WorkoutTemplate } from '@/types'

type ExerciseDraft = Omit<ExerciseTemplate, 'id'> & { _key: string }

function defaultExercise(order: number): ExerciseDraft {
  return {
    _key: uuid(),
    name: '',
    sets: 3,
    reps: '10',
    restSeconds: 90,
    order,
    trackBy: 'reps',
  }
}

interface Props {
  existing?: WorkoutTemplate
}

export default function TemplateForm({ existing }: Props) {
  const router = useRouter()
  const addTemplate = useEchoStore((s) => s.addTemplate)
  const updateTemplate = useEchoStore((s) => s.updateTemplate)
  const getExerciseLibrary = useEchoStore((s) => s.getExerciseLibrary)

  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [exercises, setExercises] = useState<ExerciseDraft[]>(
    existing?.exercises.map((e) => ({ ...e, _key: e.id })) ?? [defaultExercise(0)]
  )
  const [nameError, setNameError] = useState('')

  const library = getExerciseLibrary()
  const libraryId = 'exercise-library'

  const updateExercise = (key: string, data: Partial<Omit<ExerciseTemplate, 'id'>>) => {
    setExercises((prev) => prev.map((e) => (e._key === key ? { ...e, ...data } : e)))
  }

  // The last exercise can never be linked to a next one that doesn't
  // exist — clear a dangling flag whenever the list's end changes.
  const clampTrailingSuperset = (arr: ExerciseDraft[]): ExerciseDraft[] =>
    arr.map((e, i) => ({
      ...e,
      order: i,
      supersetWithNext: i === arr.length - 1 ? false : e.supersetWithNext,
    }))

  const deleteExercise = (key: string) => {
    setExercises((prev) => {
      const idx = prev.findIndex((e) => e._key === key)
      if (idx === -1) return prev
      const next = prev.filter((e) => e._key !== key)
      // The exercise right before the deleted one now points at a
      // different neighbor — its link (if any) no longer means what it
      // did, so it must not silently re-pair with whoever moved up.
      if (idx > 0) {
        const beforeKey = prev[idx - 1]._key
        return clampTrailingSuperset(
          next.map((e) => (e._key === beforeKey ? { ...e, supersetWithNext: false } : e))
        )
      }
      return clampTrailingSuperset(next)
    })
  }

  const moveExercise = (key: string, direction: 'up' | 'down') => {
    setExercises((prev) => {
      const idx = prev.findIndex((e) => e._key === key)
      if (idx === -1) return prev
      const next = direction === 'up' ? idx - 1 : idx + 1
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      // Every item whose immediate neighbor identity changed loses its
      // link: the two swapped items themselves, and whichever item sat
      // right before the swap.
      const p = Math.min(idx, next)
      for (const i of [p - 1, p, p + 1]) {
        if (i >= 0 && i < arr.length) arr[i] = { ...arr[i], supersetWithNext: false }
      }
      return clampTrailingSuperset(arr)
    })
  }

  const addExercise = () => {
    setExercises((prev) => [...prev, defaultExercise(prev.length)])
  }

  const handleImport = (imported: Omit<ExerciseTemplate, 'id' | 'order'>[]) => {
    const drafts = imported.map((e, i) => ({
      ...e,
      _key: uuid(),
      order: exercises.length + i,
    }))
    setExercises((prev) => [...prev, ...drafts])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('Nome é obrigatório')
      return
    }

    const cleanExercises: ExerciseTemplate[] = exercises.map((ex, i) => ({
      id: uuid(),
      name: ex.name || `Exercício ${i + 1}`,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds,
      notes: ex.notes,
      order: i,
      trackBy: ex.trackBy,
      durationMinutes: ex.durationMinutes,
      bodyweight: ex.bodyweight,
      warmupEnabled: ex.warmupEnabled,
      warmupPercent: ex.warmupPercent,
      progression: ex.progression,
      restPauseEnabled: ex.restPauseEnabled,
      supersetWithNext: ex.supersetWithNext,
      unilateral: ex.unilateral,
    }))

    if (existing) {
      updateTemplate(existing.id, { name: name.trim(), description: description.trim() || undefined, exercises: cleanExercises })
    } else {
      addTemplate({ name: name.trim(), description: description.trim() || undefined, exercises: cleanExercises })
    }

    router.push('/treinos')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-8">
      <datalist id={libraryId}>
        {library.map((ex) => (
          <option key={ex} value={ex} />
        ))}
      </datalist>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome do treino</Label>
          <Input
            id="name"
            placeholder="Ex: Treino A — Peito e Tríceps"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError('') }}
            className={nameError ? 'border-destructive' : ''}
          />
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Descrição (opcional)</Label>
          <Input
            id="desc"
            placeholder="Ex: Foco em hipertrofia"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Exercícios</h2>
          <CSVImport onImport={handleImport} />
        </div>

        {exercises.map((ex, i) => (
          <div key={ex._key}>
            <ExerciseBlockEditor
              exercise={ex}
              index={i}
              total={exercises.length}
              libraryId={libraryId}
              onChange={(data) => updateExercise(ex._key, data)}
              onDelete={() => deleteExercise(ex._key)}
              onMoveUp={() => moveExercise(ex._key, 'up')}
              onMoveDown={() => moveExercise(ex._key, 'down')}
            />
            {ex.supersetWithNext && (
              <div className="flex items-center gap-2 py-1.5 pl-4">
                <Repeat className="h-3 w-3 text-primary" />
                <span className="text-[11px] font-medium text-primary">
                  Superset — sem descanso até aqui
                </span>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addExercise}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Adicionar exercício
        </button>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {existing ? 'Salvar alterações' : 'Criar treino'}
        </Button>
      </div>
    </form>
  )
}
