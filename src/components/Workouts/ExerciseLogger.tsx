"use client"

import { useState } from "react"
import {
  Plus, Trash2, ChevronDown, ChevronUp, TrendingUp,
  CheckCircle2, Loader2, Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Exercise, SetLog, ExerciseFormData } from "@/types"
import { useAddExercise, useDeleteExercise, useExerciseHistory, useFinalizeWorkout } from "@/hooks/useWorkout"
import { parseSetsLog } from "@/lib/services/workout-service"
import { useAppStore } from "@/store/app-store"

interface Props {
  workoutId: string
  exercises: Exercise[]
}

export default function ExerciseLogger({ workoutId, exercises }: Props) {
  const addMutation = useAddExercise(workoutId)
  const finalizeMutation = useFinalizeWorkout(workoutId)
  const { workouts } = useAppStore()

  const [showForm, setShowForm] = useState(exercises.length === 0)
  const [form, setForm] = useState<ExerciseFormData>({
    name: "", sets: 4, reps: 12, weight: undefined,
  })

  // Always read from Zustand — local changes are reflected immediately
  const currentWorkout = workouts.find((w) => w.id === workoutId)
  const currentExercises = currentWorkout?.exercises ?? exercises

  const totalVolume = currentExercises.reduce((sum, ex) => {
    const logs = parseSetsLog(ex.setsLog)
    return sum + logs.filter((s) => s.done).reduce((s, set) => s + set.weight * set.reps, 0)
  }, 0)

  const totalDone = currentExercises.filter((e) => e.completed).length
  const allDone = currentExercises.length > 0 && totalDone === currentExercises.length

  // Write to Zustand only — no API call, instant response
  function updateExerciseLocal(exerciseId: string, setsLog: string, completed: boolean) {
    const store = useAppStore.getState()
    store.setWorkouts(
      store.workouts.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: (w.exercises ?? []).map((e) =>
                e.id === exerciseId ? { ...e, setsLog, completed } : e
              ),
            }
          : w
      )
    )
  }

  async function handleFinalize() {
    await finalizeMutation.mutateAsync(
      currentExercises.map((e) => ({ id: e.id, setsLog: e.setsLog, completed: e.completed }))
    )
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    await addMutation.mutateAsync({
      name: form.name.trim(),
      sets: form.sets,
      reps: form.reps,
      weight: form.weight,
    })
    setForm({ name: "", sets: 4, reps: 12, weight: undefined })
    setShowForm(false)
  }

  // Completed on server (after successful finalize or re-opened completed workout)
  if (currentWorkout?.completed) {
    return <CompletionCard exercises={currentExercises} volume={totalVolume} />
  }

  return (
    <div className="space-y-3">
      {/* Stats header */}
      {currentExercises.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <StatChip label="Blocos" value={currentExercises.length} />
          <StatChip
            label="Prontos"
            value={`${totalDone}/${currentExercises.length}`}
            accent={totalDone > 0}
          />
          <StatChip
            label="Volume"
            value={
              totalVolume > 0
                ? totalVolume >= 1000
                  ? `${(totalVolume / 1000).toFixed(1)}t`
                  : `${totalVolume}kg`
                : "—"
            }
          />
        </div>
      )}

      {/* Exercise blocks */}
      {currentExercises.map((ex) => (
        <ExerciseBlock
          key={ex.id}
          exercise={ex}
          workoutId={workoutId}
          onUpdate={updateExerciseLocal}
        />
      ))}

      {/* Add exercise form */}
      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="p-4 rounded-2xl border border-violet-500/25 bg-violet-500/5 space-y-4"
        >
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Novo bloco</p>
          <input
            required
            placeholder="Nome do exercício *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/25"
            autoFocus
          />
          <div className="grid grid-cols-3 gap-2">
            <NumField label="Séries" placeholder="4" value={form.sets}
              onChange={(v) => setForm((f) => ({ ...f, sets: v }))} />
            <NumField label="Reps" placeholder="12" value={form.reps}
              onChange={(v) => setForm((f) => ({ ...f, reps: v }))} />
            <NumField label="Peso (kg)" placeholder="80" step={0.5} value={form.weight}
              onChange={(v) => setForm((f) => ({ ...f, weight: v }))} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-xl text-sm text-white/40 bg-white/3 active:bg-white/8">
              Cancelar
            </button>
            <button type="submit" disabled={!form.name.trim() || addMutation.isPending}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-violet-500 active:bg-violet-600 disabled:opacity-40">
              {addMutation.isPending ? "..." : "Adicionar"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-white/12 text-white/35 active:border-violet-500/30 active:text-violet-400 transition-all text-sm"
        >
          <Plus size={16} />
          Adicionar bloco
        </button>
      )}

      {/* Finalize button */}
      {currentExercises.length > 0 && (
        <div className="pt-2 space-y-2">
          {!allDone && totalDone > 0 && (
            <p className="text-center text-[11px] text-white/30">
              {currentExercises.length - totalDone} bloco{currentExercises.length - totalDone > 1 ? "s" : ""} pendente{currentExercises.length - totalDone > 1 ? "s" : ""}
            </p>
          )}
          <button
            onClick={handleFinalize}
            disabled={finalizeMutation.isPending}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold transition-all duration-300",
              allDone
                ? "bg-green-500 text-white shadow-lg shadow-green-500/25 active:bg-green-600"
                : "bg-white/6 border border-white/10 text-white/50 active:bg-white/10"
            )}
          >
            {finalizeMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sincronizando…
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                {allDone
                  ? "Finalizar treino"
                  : `Finalizar · ${totalDone}/${currentExercises.length} prontos`}
              </>
            )}
          </button>
          {finalizeMutation.isError && (
            <p className="text-center text-xs text-red-400">
              {(finalizeMutation.error as Error)?.message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Completion card ──────────────────────────────────────────────────────────

function CompletionCard({ exercises, volume }: { exercises: Exercise[]; volume: number }) {
  const totalSets = exercises.reduce((sum, ex) => {
    return sum + parseSetsLog(ex.setsLog).filter((s) => s.done).length
  }, 0)

  return (
    <div className="rounded-2xl border border-green-500/25 bg-green-500/5 p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
        <Trophy size={28} className="text-green-400" />
      </div>
      <div>
        <p className="text-lg font-bold text-green-400">Treino concluído!</p>
        <p className="text-sm text-white/40 mt-0.5">Dados sincronizados com sucesso</p>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-white/4 rounded-xl p-3">
          <p className="text-lg font-bold">{exercises.length}</p>
          <p className="text-[10px] text-white/35 mt-0.5">Exercícios</p>
        </div>
        <div className="bg-white/4 rounded-xl p-3">
          <p className="text-lg font-bold">{totalSets}</p>
          <p className="text-[10px] text-white/35 mt-0.5">Séries</p>
        </div>
        <div className="bg-white/4 rounded-xl p-3">
          <p className="text-lg font-bold tabular-nums">
            {volume >= 1000 ? `${(volume / 1000).toFixed(1)}t` : `${volume}kg`}
          </p>
          <p className="text-[10px] text-white/35 mt-0.5">Volume</p>
        </div>
      </div>
    </div>
  )
}

// ─── ExerciseBlock ────────────────────────────────────────────────────────────

function ExerciseBlock({
  exercise: ex,
  workoutId,
  onUpdate,
}: {
  exercise: Exercise
  workoutId: string
  onUpdate: (exerciseId: string, setsLog: string, completed: boolean) => void
}) {
  const deleteMutation = useDeleteExercise(workoutId)
  const history = useExerciseHistory(workoutId, ex.name)
  const [collapsed, setCollapsed] = useState(false)

  const sets = parseSetsLog(ex.setsLog)
  const doneSets = sets.filter((s) => s.done).length
  const volume = sets.filter((s) => s.done).reduce((sum, s) => sum + s.weight * s.reps, 0)
  const allDone = sets.length > 0 && doneSets === sets.length

  function updateSet(index: number, patch: Partial<SetLog>) {
    const next = sets.map((s, i) => (i === index ? { ...s, ...patch } : s))
    onUpdate(ex.id, JSON.stringify(next), next.every((s) => s.done))
  }

  const lastWeight = history?.sets[0]?.weight
  const daysSince = history
    ? Math.round((Date.now() - history.date.getTime()) / 86400000)
    : null

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all",
      allDone ? "border-green-500/20 bg-green-500/5" : "border-white/10 bg-white/4"
    )}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className={cn(
          "w-2 self-stretch rounded-full flex-shrink-0",
          allDone ? "bg-green-500" : "bg-violet-500"
        )} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{ex.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-white/40">
              {ex.sets ?? "?"} × {ex.reps ?? "?"} reps
              {ex.weight ? ` · ${ex.weight}kg` : ""}
            </span>
            {volume > 0 && <span className="text-xs text-violet-400/70">{volume}kg vol</span>}
          </div>
          {history && lastWeight !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={10} className="text-emerald-400 flex-shrink-0" />
              <span className="text-[11px] text-emerald-400/80">
                Última: {lastWeight}kg
                {history.sets[0]?.reps ? ` × ${history.sets[0].reps}` : ""}
                {" "}<span className="text-white/25">
                  ({daysSince === 0 ? "hoje" : daysSince === 1 ? "ontem" : `${daysSince}d atrás`})
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-white/30 tabular-nums">{doneSets}/{sets.length}</span>
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center text-white/25 active:text-white/60">
            {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
          <button onClick={() => deleteMutation.mutate(ex.id)}
            className="w-8 h-8 flex items-center justify-center text-white/20 active:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {sets.length > 0 && (
        <div className="mx-4 h-1 bg-white/8 rounded-full overflow-hidden mb-3">
          <div
            className={cn("h-full rounded-full transition-all duration-300", allDone ? "bg-green-500" : "bg-violet-500")}
            style={{ width: `${(doneSets / sets.length) * 100}%` }}
          />
        </div>
      )}

      {!collapsed && sets.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          {sets.map((set, i) => (
            <SetRow key={i} index={i} set={set} onChange={(patch) => updateSet(i, patch)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── SetRow ───────────────────────────────────────────────────────────────────

function SetRow({ index, set, onChange }: {
  index: number; set: SetLog; onChange: (patch: Partial<SetLog>) => void
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-all",
      set.done ? "bg-green-500/10 border-green-500/20" : "bg-white/3 border-white/8"
    )}>
      <span className={cn("text-xs font-bold w-6 text-center flex-shrink-0",
        set.done ? "text-green-400" : "text-white/30")}>
        {index + 1}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <input type="number" min={0} step={0.5} value={set.weight || ""}
            onChange={(e) => onChange({ weight: Number(e.target.value) || 0 })}
            placeholder="kg" inputMode="decimal"
            className="w-full bg-transparent text-sm font-semibold text-center outline-none placeholder:text-white/20" />
          <span className="text-[10px] text-white/30 flex-shrink-0">kg</span>
        </div>
      </div>
      <span className="text-white/15 text-xs">×</span>
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <input type="number" min={0} step={1} value={set.reps || ""}
            onChange={(e) => onChange({ reps: Number(e.target.value) || 0 })}
            placeholder="reps" inputMode="numeric"
            className="w-full bg-transparent text-sm font-semibold text-center outline-none placeholder:text-white/20" />
          <span className="text-[10px] text-white/30 flex-shrink-0">reps</span>
        </div>
      </div>
      <button onClick={() => onChange({ done: !set.done })}
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all active:scale-90",
          set.done
            ? "border-green-500 bg-green-500/20 text-green-400"
            : "border-white/20 text-white/25 hover:border-violet-400 hover:text-violet-400"
        )}>
        <svg viewBox="0 0 12 12" className="w-4 h-4">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2"
            fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatChip({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-white/3 rounded-xl p-3 text-center border border-white/6">
      <p className={cn("text-lg font-bold tabular-nums", accent && "text-violet-400")}>{value}</p>
      <p className="text-[10px] text-white/30 mt-0.5">{label}</p>
    </div>
  )
}

function NumField({ label, placeholder, value, step = 1, onChange }: {
  label: string; placeholder: string; value?: number; step?: number; onChange: (v?: number) => void
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-white/40">{label}</label>
      <input type="number" min={0} step={step} placeholder={placeholder} value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        inputMode="decimal"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20 text-center" />
    </div>
  )
}
