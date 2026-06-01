"use client"

import { useState } from "react"
import { Plus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Exercise, ExerciseFormData } from "@/types"
import { useAddExercise, useUpdateExercise, useDeleteExercise } from "@/hooks/useWorkout"

interface Props {
  workoutId: string
  exercises: Exercise[]
}

export default function ExerciseLogger({ workoutId, exercises }: Props) {
  const addMutation = useAddExercise(workoutId)
  const updateMutation = useUpdateExercise(workoutId)
  const deleteMutation = useDeleteExercise(workoutId)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ExerciseFormData>({ name: "", sets: undefined, reps: undefined, weight: undefined })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await addMutation.mutateAsync(form)
    setForm({ name: "", sets: undefined, reps: undefined, weight: undefined })
    setShowForm(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Exercícios ({exercises.length})
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input
                  required
                  placeholder="Ex: Supino Reto"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label>Séries</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="4"
                    value={form.sets ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="12"
                    value={form.reps ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="80"
                    value={form.weight ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="flex-1" disabled={addMutation.isPending}>
                  Adicionar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {exercises.map((ex) => (
          <Card key={ex.id} className={cn(ex.completed && "opacity-60")}>
            <CardContent className="flex items-center gap-3 p-3">
              <button
                onClick={() => updateMutation.mutate({ exerciseId: ex.id, data: { completed: !ex.completed } })}
                className={cn(
                  "flex-shrink-0 h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center",
                  ex.completed ? "border-primary bg-primary" : "border-muted-foreground hover:border-primary"
                )}
              >
                {ex.completed && <Check className="h-3 w-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", ex.completed && "line-through text-muted-foreground")}>
                  {ex.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[ex.sets && `${ex.sets} séries`, ex.reps && `${ex.reps} reps`, ex.weight && `${ex.weight}kg`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => deleteMutation.mutate(ex.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
