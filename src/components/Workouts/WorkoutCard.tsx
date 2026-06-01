"use client"

import Link from "next/link"
import { Dumbbell, Trash2, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/date"
import type { Workout } from "@/types"
import { useDeleteWorkout } from "@/hooks/useWorkout"

interface Props {
  workout: Workout
}

export default function WorkoutCard({ workout }: Props) {
  const deleteMutation = useDeleteWorkout()

  return (
    <Card className={cn(workout.completed && "opacity-70")}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Dumbbell className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{workout.name}</p>
            {workout.completed && <Badge variant="success" className="text-[10px] px-1.5 py-0">Concluído</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(workout.date)} · {workout.exercises?.length ?? 0} exercícios
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => deleteMutation.mutate(workout.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Link href={`/treinos/${workout.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
