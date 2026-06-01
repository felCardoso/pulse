"use client"

import WorkoutCard from "./WorkoutCard"
import type { Workout } from "@/types"

interface Props {
  workouts: Workout[]
}

export default function WorkoutList({ workouts }: Props) {
  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">Nenhum treino registrado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {workouts.map((w) => (
        <WorkoutCard key={w.id} workout={w} />
      ))}
    </div>
  )
}
