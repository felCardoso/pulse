"use client"

import { useState } from "react"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
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
  const [showForm, setShowForm] = useState(exercises.length === 0)
  const [form, setForm] = useState<ExerciseFormData>({
    name: "", sets: undefined, reps: undefined, weight: undefined,
  })

  const totalVolume = exercises.reduce((sum, ex) => {
    if (ex.sets && ex.reps && ex.weight) return sum + ex.sets * ex.reps * ex.weight
    return sum
  }, 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    await addMutation.mutateAsync(form)
    setForm({ name: "", sets: undefined, reps: undefined, weight: undefined })
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      {exercises.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <StatChip label="Exercícios" value={exercises.length} />
          <StatChip label="Concluídos" value={exercises.filter((e) => e.completed).length} accent />
          <StatChip label="Volume" value={totalVolume > 0 ? `${totalVolume}kg` : "—"} />
        </div>
      )}

      {/* Exercise list */}
      <div className="space-y-2">
        {exercises.map((ex) => (
          <ExerciseRow
            key={ex.id}
            exercise={ex}
            onToggle={() => updateMutation.mutate({ exerciseId: ex.id, data: { completed: !ex.completed } })}
            onDelete={() => deleteMutation.mutate(ex.id)}
          />
        ))}
      </div>

      {/* Add form */}
      {showForm ? (
        <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-3">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Novo exercício</p>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              required
              placeholder="Nome do exercício *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/25"
              autoFocus
            />
            <div className="grid grid-cols-3 gap-2">
              <NumInput
                label="Séries"
                placeholder="4"
                value={form.sets}
                onChange={(v) => setForm((f) => ({ ...f, sets: v }))}
              />
              <NumInput
                label="Reps"
                placeholder="12"
                value={form.reps}
                onChange={(v) => setForm((f) => ({ ...f, reps: v }))}
              />
              <NumInput
                label="Peso (kg)"
                placeholder="80"
                step={0.5}
                value={form.weight}
                onChange={(v) => setForm((f) => ({ ...f, weight: v }))}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl text-sm text-white/40 bg-white/3 active:bg-white/8 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!form.name.trim() || addMutation.isPending}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-violet-500 active:bg-violet-600 disabled:opacity-40 transition-all"
              >
                {addMutation.isPending ? "..." : "Adicionar"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-white/15 text-white/40 active:border-violet-500/30 active:text-violet-400 transition-all text-sm"
        >
          <Plus size={16} />
          Adicionar exercício
        </button>
      )}
    </div>
  )
}

function ExerciseRow({
  exercise: ex,
  onToggle,
  onDelete,
}: {
  exercise: Exercise
  onToggle: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const specs = [
    ex.sets && `${ex.sets} séries`,
    ex.reps && `${ex.reps} reps`,
    ex.weight && `${ex.weight} kg`,
    ex.duration && `${ex.duration}s`,
  ].filter(Boolean).join(" · ")

  const volume = ex.sets && ex.reps && ex.weight ? ex.sets * ex.reps * ex.weight : null

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      ex.completed ? "bg-white/3 border-white/6 opacity-70" : "bg-white/5 border-white/10"
    )}>
      <div className="flex items-center gap-3 p-3">
        {/* Check button */}
        <button
          onClick={onToggle}
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all active:scale-90",
            ex.completed
              ? "border-green-500 bg-green-500/20"
              : "border-white/25 hover:border-violet-400"
          )}
        >
          {ex.completed && (
            <svg viewBox="0 0 12 12" className="w-5 h-5 text-green-400">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium", ex.completed && "line-through text-white/40")}>
            {ex.name}
          </p>
          {specs && <p className="text-xs text-white/40 mt-0.5">{specs}</p>}
        </div>

        <div className="flex items-center gap-1">
          {volume && (
            <span className="text-[11px] text-violet-400/70 font-mono mr-1">{volume}kg</span>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 flex items-center justify-center text-white/25 active:text-white/60"
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center text-white/20 active:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded sets view */}
      {open && ex.sets && (
        <div className="px-3 pb-3">
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: ex.sets }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 min-w-[60px] py-2 rounded-lg text-center text-xs border",
                  i < (ex.sets ?? 0) && ex.completed
                    ? "bg-green-500/15 border-green-500/30 text-green-400"
                    : "bg-white/3 border-white/8 text-white/40"
                )}
              >
                <span className="block font-mono font-semibold">{ex.reps ?? "—"}</span>
                <span className="text-[10px] opacity-60">reps</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatChip({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-white/3 rounded-xl p-3 text-center border border-white/6">
      <p className={cn("text-lg font-bold tabular-nums", accent && "text-violet-400")}>{value}</p>
      <p className="text-[10px] text-white/35 mt-0.5">{label}</p>
    </div>
  )
}

function NumInput({
  label, placeholder, value, step = 1, onChange,
}: {
  label: string; placeholder: string; value?: number; step?: number; onChange: (v?: number) => void
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-white/40">{label}</label>
      <input
        type="number"
        min={0}
        step={step}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20 text-center"
        inputMode="decimal"
      />
    </div>
  )
}
