"use client"

import Link from "next/link"
import { Dumbbell, Salad, Flame, ChevronRight, Plus } from "lucide-react"
import { useWorkouts } from "@/hooks/useWorkout"
import { useMeals } from "@/hooks/useDiet"
import { useHabits } from "@/hooks/useHabit"
import { useAppStore } from "@/store/app-store"
import { isToday } from "@/utils/date"
import { sum } from "@/utils/numbers"

export default function DashboardPage() {
  const { user, habitLogs } = useAppStore()
  const todayStr = new Date().toISOString().split("T")[0]
  const dayName = new Date().toLocaleDateString("pt-BR", { weekday: "long" })

  const { data: workouts = [] } = useWorkouts()
  const { data: meals = [] } = useMeals()
  const { data: habits = [] } = useHabits()

  const todayWorkout = workouts.find((w) => isToday(w.date))
  const todayMeals = meals.filter((m) => isToday(m.date))
  const totalCal = Math.round(sum(todayMeals.map((m) => m.calories)))
  const totalProt = Math.round(sum(todayMeals.map((m) => m.protein)))

  const thisWeekStart = (() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(new Date().setDate(diff))
  })()
  const weekWorkouts = workouts.filter((w) => new Date(w.date) >= thisWeekStart)

  const todayHabits = habits.filter((h) => {
    const today = new Date().getDay()
    if (h.frequency === "weekdays") return today >= 1 && today <= 5
    if (h.frequency === "weekend") return today === 0 || today === 6
    return true
  })
const todayVolume = todayWorkout
    ? (todayWorkout.exercises ?? []).reduce(
        (s, ex) => s + (ex.sets && ex.reps && ex.weight ? ex.sets * ex.reps * ex.weight : 0), 0
      )
    : 0

  const name = user?.name ?? user?.email?.split("@")[0] ?? "Atleta"

  return (
    <div className="py-6 space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-white/40 capitalize">{dayName}</p>
        <h1 className="text-2xl font-bold">Olá, {name} 👋</h1>
      </div>

      {/* Today's workout — hero card */}
      {todayWorkout ? (
        <Link href={`/treinos/${todayWorkout.id}`} className="block">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-900/10 border border-violet-500/20 active:scale-[0.98] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-violet-400/80 font-medium uppercase tracking-wider">Treino de hoje</p>
                <p className="text-lg font-bold mt-0.5">{todayWorkout.name}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Dumbbell size={20} className="text-violet-400" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold tabular-nums text-violet-300">
                  {todayWorkout.exercises?.filter(e => e.completed).length}/{todayWorkout.exercises?.length ?? 0}
                </p>
                <p className="text-[11px] text-white/40">exercícios</p>
              </div>
              {todayVolume > 0 && (
                <div>
                  <p className="text-2xl font-bold tabular-nums">{todayVolume}kg</p>
                  <p className="text-[11px] text-white/40">volume</p>
                </div>
              )}
            </div>
            {(todayWorkout.exercises?.length ?? 0) > 0 && (
              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-400 transition-all"
                  style={{
                    width: `${((todayWorkout.exercises?.filter(e => e.completed).length ?? 0) / (todayWorkout.exercises?.length ?? 1)) * 100}%`
                  }}
                />
              </div>
            )}
          </div>
        </Link>
      ) : (
        <Link href="/treinos/new" className="block">
          <div className="p-5 rounded-2xl border border-dashed border-white/15 flex items-center gap-4 active:border-violet-500/30 active:bg-violet-500/5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <Plus size={22} className="text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Iniciar treino de hoje</p>
              <p className="text-xs text-white/35 mt-0.5">Registre seus exercícios</p>
            </div>
          </div>
        </Link>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3">
        <QuickStat
          icon={<Dumbbell size={16} className="text-violet-400" />}
          title="Semana"
          value={`${weekWorkouts.length} treinos`}
          href="/treinos"
        />
        <QuickStat
          icon={<Salad size={16} className="text-emerald-400" />}
          title="Hoje"
          value={totalCal > 0 ? `${totalCal} kcal` : "Sem refeições"}
          sub={totalProt > 0 ? `${totalProt}g proteína` : undefined}
          href="/dieta"
        />
      </div>

      {/* Habits strip */}
      {todayHabits.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/35 uppercase tracking-wider">Hábitos hoje</p>
            <Link href="/habitos" className="text-[11px] text-violet-400 flex items-center gap-0.5">
              Ver tudo <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {todayHabits.slice(0, 6).map((h) => {
              const done = habitLogs.some((l) => l.habitId === h.id && l.date === todayStr && l.completed)
              return (
                <Link
                  key={h.id}
                  href="/habitos"
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border transition-all"
                  style={{
                    borderColor: done ? h.color + "44" : "rgba(255,255,255,0.08)",
                    backgroundColor: done ? h.color + "15" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: done ? h.color : "rgba(255,255,255,0.2)" }} />
                  <span className="text-[11px] font-medium text-white/60 max-w-[60px] text-center leading-tight">{h.name}</span>
                  {done && <Flame size={10} className="text-orange-400" />}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Recent workouts */}
      {workouts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/35 uppercase tracking-wider">Últimos treinos</p>
            <Link href="/treinos" className="text-[11px] text-violet-400 flex items-center gap-0.5">
              Ver tudo <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {workouts.slice(0, 3).map((w) => (
              <Link key={w.id} href={`/treinos/${w.id}`} className="block">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3 active:bg-white/6 transition-all">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.completed ? "bg-green-400" : "bg-violet-400"}`} />
                  <span className="flex-1 text-sm truncate">{w.name}</span>
                  <span className="text-xs text-white/30">
                    {new Date(w.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function QuickStat({ icon, title, value, sub, href }: {
  icon: React.ReactNode; title: string; value: string; sub?: string; href: string
}) {
  return (
    <Link href={href} className="block">
      <div className="p-4 rounded-xl border border-white/8 bg-white/3 active:bg-white/6 transition-all">
        <div className="flex items-center gap-1.5 mb-2">
          {icon}
          <span className="text-[11px] text-white/35 uppercase tracking-wider font-medium">{title}</span>
        </div>
        <p className="text-base font-bold">{value}</p>
        {sub && <p className="text-xs text-white/35 mt-0.5">{sub}</p>}
      </div>
    </Link>
  )
}
