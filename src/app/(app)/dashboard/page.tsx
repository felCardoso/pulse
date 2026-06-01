"use client"

import Link from "next/link"
import { Plus, CalendarCheck, Dumbbell, Salad } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRoutines } from "@/hooks/useRoutine"
import { useWorkouts } from "@/hooks/useWorkout"
import { useMeals } from "@/hooks/useDiet"
import { useAppStore } from "@/store/app-store"
import { getTodayDayOfWeek, isToday } from "@/utils/date"
import { sum } from "@/utils/numbers"

export default function DashboardPage() {
  const { user } = useAppStore()
  const today = getTodayDayOfWeek()

  const { data: routines = [] } = useRoutines()
  const { data: workouts = [] } = useWorkouts()
  const { data: meals = [] } = useMeals()

  const todayRoutines = routines.filter((r) => r.day === today)
  const completedRoutines = todayRoutines.filter((r) => r.completed)
  const todayWorkouts = workouts.filter((w) => isToday(w.date))
  const todayMeals = meals.filter((m) => isToday(m.date))
  const totalCal = sum(todayMeals.map((m) => m.calories))

  return (
    <div className="py-6 space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">Bem-vindo de volta,</p>
        <h1 className="text-2xl font-bold">{user?.name ?? user?.email?.split("@")[0] ?? "Usuário"}</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <CalendarCheck className="h-5 w-5 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{completedRoutines.length}/{todayRoutines.length}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Rotinas hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Dumbbell className="h-5 w-5 mx-auto text-violet-400 mb-2" />
            <p className="text-2xl font-bold">{todayWorkouts.length}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Treinos hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Salad className="h-5 w-5 mx-auto text-emerald-400 mb-2" />
            <p className="text-2xl font-bold">{Math.round(totalCal)}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">kcal hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Ação rápida
        </h2>
        <div className="flex flex-col gap-2">
          <Link href="/rotinas/new">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Plus className="h-4 w-4" />
              Nova Rotina
            </Button>
          </Link>
          <Link href="/treinos/new">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Plus className="h-4 w-4" />
              Novo Treino
            </Button>
          </Link>
          <Link href="/dieta/new">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Plus className="h-4 w-4" />
              Nova Refeição
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's routines preview */}
      {todayRoutines.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Rotinas de Hoje
            </h2>
            <Link href="/rotinas" className="text-xs text-primary">Ver tudo</Link>
          </div>
          <div className="space-y-2">
            {todayRoutines.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${r.completed ? "bg-primary" : "bg-muted-foreground"}`} />
                <span className={r.completed ? "line-through text-muted-foreground" : ""}>{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
