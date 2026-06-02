"use client"

import WorkoutCard from "./WorkoutCard"
import type { Workout } from "@/types"

interface Props {
  workouts: Workout[]
}

function groupByWeek(workouts: Workout[]): { label: string; items: Workout[] }[] {
  const groups: Record<string, Workout[]> = {}
  for (const w of workouts) {
    const d = new Date(w.date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(new Date(d).setDate(diff))
    const key = monday.toISOString().split("T")[0]
    if (!groups[key]) groups[key] = []
    groups[key].push(w)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const monday = new Date(key)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      const now = new Date()
      const thisMonday = new Date()
      const d = now.getDay()
      thisMonday.setDate(now.getDate() - d + (d === 0 ? -6 : 1))
      thisMonday.setHours(0, 0, 0, 0)

      const isThis = monday.toDateString() === thisMonday.toDateString()
      const label = isThis
        ? "Esta semana"
        : `${monday.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`
      return { label, items }
    })
}

export default function WorkoutList({ workouts }: Props) {
  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-2">
          <span className="text-3xl">🏋️</span>
        </div>
        <p className="font-semibold text-white/60">Nenhum treino ainda</p>
        <p className="text-xs text-white/30">Toque no + para começar</p>
      </div>
    )
  }

  const groups = groupByWeek(workouts)

  return (
    <div className="space-y-5">
      {groups.map(({ label, items }) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/35 uppercase tracking-wider">{label}</p>
            <p className="text-xs text-white/25">{items.length} treino{items.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="space-y-2">
            {items.map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
