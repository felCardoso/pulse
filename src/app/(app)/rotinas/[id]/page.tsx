"use client"

import { useParams } from "next/navigation"
import { useRoutines } from "@/hooks/useRoutine"
import { dayLabel } from "@/utils/date"
import { Badge } from "@/components/ui/badge"

export default function RotinaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: routines = [] } = useRoutines()
  const routine = routines.find((r) => r.id === id)

  if (!routine) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Rotina não encontrada.
      </div>
    )
  }

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-xl font-bold">{routine.name}</h1>
        <Badge variant={routine.completed ? "success" : "secondary"}>
          {routine.completed ? "Concluída" : "Pendente"}
        </Badge>
      </div>
      {routine.description && (
        <p className="text-muted-foreground text-sm">{routine.description}</p>
      )}
      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">Dia: <span className="text-foreground font-medium">{dayLabel(routine.day)}</span></span>
        {routine.time && (
          <span className="text-muted-foreground">Horário: <span className="text-foreground font-medium">{routine.time}</span></span>
        )}
      </div>
    </div>
  )
}
