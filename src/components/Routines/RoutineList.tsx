"use client"

import RoutineCard from "./RoutineCard"
import type { Routine } from "@/types"

interface Props {
  routines: Routine[]
  emptyMessage?: string
}

export default function RoutineList({ routines, emptyMessage = "Nenhuma rotina encontrada." }: Props) {
  if (routines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {routines.map((r) => (
        <RoutineCard key={r.id} routine={r} />
      ))}
    </div>
  )
}
