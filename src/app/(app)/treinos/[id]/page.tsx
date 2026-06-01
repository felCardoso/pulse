"use client"

import { useParams } from "next/navigation"
import { useWorkouts } from "@/hooks/useWorkout"
import { formatDate } from "@/utils/date"
import { Badge } from "@/components/ui/badge"
import ExerciseLogger from "@/components/Workouts/ExerciseLogger"

export default function TreinoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: workouts = [] } = useWorkouts()
  const workout = workouts.find((w) => w.id === id)

  if (!workout) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Treino não encontrado.
      </div>
    )
  }

  return (
    <div className="py-6 space-y-5">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold">{workout.name}</h1>
          <Badge variant={workout.completed ? "success" : "secondary"}>
            {workout.completed ? "Concluído" : "Em andamento"}
          </Badge>
        </div>
        {workout.description && (
          <p className="text-sm text-muted-foreground mt-1">{workout.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{formatDate(workout.date)}</p>
      </div>

      <ExerciseLogger workoutId={workout.id} exercises={workout.exercises ?? []} />
    </div>
  )
}
