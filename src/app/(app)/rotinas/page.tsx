"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import RoutineList from "@/components/Routines/RoutineList"
import { useRoutines } from "@/hooks/useRoutine"
import { cn } from "@/lib/utils"
import { getTodayDayOfWeek, dayLabel } from "@/utils/date"
import type { DayOfWeek } from "@/types"

const DAYS: DayOfWeek[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]

export default function RotinasPage() {
  const today = getTodayDayOfWeek()
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(today)
  const { data: routines = [], isLoading } = useRoutines()

  const filtered = routines.filter((r) => r.day === selectedDay)

  return (
    <div className="py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Rotinas</h1>
        <Link href="/rotinas/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </Link>
      </div>

      {/* Day filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              selectedDay === d
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {dayLabel(d)}
            {d === today && " •"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <RoutineList
          routines={filtered}
          emptyMessage={`Sem rotinas para ${dayLabel(selectedDay)}. Adicione uma!`}
        />
      )}
    </div>
  )
}
