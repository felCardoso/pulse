"use client"

import { Clock, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Routine } from "@/types"
import { useCheckRoutine, useDeleteRoutine } from "@/hooks/useRoutine"

interface Props {
  routine: Routine
}

export default function RoutineCard({ routine }: Props) {
  const checkMutation = useCheckRoutine()
  const deleteMutation = useDeleteRoutine()

  return (
    <Card className={cn("transition-opacity", routine.completed && "opacity-60")}>
      <CardContent className="flex items-center gap-3 p-4">
        <button
          onClick={() => checkMutation.mutate({ id: routine.id, completed: !routine.completed })}
          className={cn(
            "flex-shrink-0 h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center",
            routine.completed
              ? "border-primary bg-primary"
              : "border-muted-foreground hover:border-primary"
          )}
          aria-label="Toggle completado"
        >
          {routine.completed && (
            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm truncate", routine.completed && "line-through text-muted-foreground")}>
            {routine.name}
          </p>
          {routine.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{routine.description}</p>
          )}
          {routine.time && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              {routine.time}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
          onClick={() => deleteMutation.mutate(routine.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
