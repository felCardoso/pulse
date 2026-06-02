"use client"

import Link from "next/link"
import { Plus, TrendingUp } from "lucide-react"
import WorkoutList from "@/components/Workouts/WorkoutList"
import { useWorkouts } from "@/hooks/useWorkout"
import { isToday } from "@/utils/date"

export default function TreinosPage() {
  const { data: workouts = [], isLoading } = useWorkouts()

  const thisWeekStart = (() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(new Date().setDate(diff))
  })()

  const weekWorkouts = workouts.filter((w) => new Date(w.date) >= thisWeekStart)
  const totalExercises = weekWorkouts.reduce((n, w) => n + (w.exercises?.length ?? 0), 0)
  const totalVolume = weekWorkouts.reduce((sum, w) =>
    sum + (w.exercises ?? []).reduce((s, ex) =>
      s + (ex.sets && ex.reps && ex.weight ? ex.sets * ex.reps * ex.weight : 0), 0), 0)

  const todayWorkout = workouts.find((w) => isToday(w.date))

  return (
    <div className="py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Treinos</h1>
        <Link
          href="/treinos/new"
          className="flex items-center gap-1.5 bg-violet-500 hover:bg-violet-600 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
        >
          <Plus size={16} />
          Novo
        </Link>
      </div>

      {/* Weekly stats */}
      <div className="grid grid-cols-3 gap-2">
        <WeekStat label="Esta semana" value={weekWorkouts.length} unit="treinos" />
        <WeekStat label="Exercícios" value={totalExercises} unit="total" />
        <WeekStat
          label="Volume"
          value={totalVolume >= 1000 ? (totalVolume / 1000).toFixed(1) : totalVolume}
          unit={totalVolume >= 1000 ? "toneladas" : "kg"}
          accent
        />
      </div>

      {/* Today's workout CTA */}
      {!isLoading && todayWorkout && (
        <Link href={`/treinos/${todayWorkout.id}`} className="block">
          <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-3 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-violet-400/80 font-medium">Treino de hoje</p>
              <p className="text-sm font-semibold truncate">{todayWorkout.name}</p>
            </div>
            <p className="text-xs text-violet-400/60 flex-shrink-0">
              {todayWorkout.exercises?.filter(e => e.completed).length}/{todayWorkout.exercises?.length ?? 0}
            </p>
          </div>
        </Link>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <WorkoutList workouts={workouts} />
      )}
    </div>
  )
}

function WeekStat({ label, value, unit, accent }: {
  label: string; value: number | string; unit: string; accent?: boolean
}) {
  return (
    <div className="bg-white/4 rounded-xl p-3 border border-white/8">
      <p className={`text-xl font-bold tabular-nums ${accent ? "text-violet-400" : ""}`}>{value}</p>
      <p className="text-[10px] text-white/40 mt-0.5">{unit}</p>
      <p className="text-[10px] text-white/25">{label}</p>
    </div>
  )
}
