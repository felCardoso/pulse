"use client"

import Link from "next/link"
import { Dumbbell, Trash2, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/date"
import type { Workout } from "@/types"
import { useDeleteWorkout } from "@/hooks/useWorkout"

interface Props {
  workout: Workout
}

export default function WorkoutCard({ workout }: Props) {
  const deleteMutation = useDeleteWorkout()

  const totalVolume = (workout.exercises ?? []).reduce((sum, ex) => {
    if (ex.sets && ex.reps && ex.weight) return sum + ex.sets * ex.reps * ex.weight
    return sum
  }, 0)
  const doneCount = (workout.exercises ?? []).filter((e) => e.completed).length
  const totalCount = workout.exercises?.length ?? 0

  return (
    <div className={cn(
      "relative flex items-stretch gap-0 rounded-2xl border overflow-hidden transition-all active:scale-[0.98]",
      workout.completed ? "bg-white/3 border-white/8" : "bg-white/5 border-white/10"
    )}>
      {/* Color accent bar */}
      <div className={cn(
        "w-1 flex-shrink-0",
        workout.completed ? "bg-green-500/60" : "bg-violet-500"
      )} />

      <div className="flex-1 flex items-center gap-3 p-4">
        <div className={cn(
          "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center",
          workout.completed ? "bg-green-500/15" : "bg-violet-500/15"
        )}>
          {workout.completed
            ? <Check size={20} className="text-green-400" />
            : <Dumbbell size={20} className="text-violet-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{workout.name}</p>
          <p className="text-xs text-white/40 mt-0.5">{formatDate(workout.date)}</p>
          {totalCount > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-white/50">
                {doneCount}/{totalCount} exercícios
              </span>
              {totalVolume > 0 && (
                <span className="text-[11px] text-violet-400/70">
                  · {totalVolume >= 1000 ? `${(totalVolume/1000).toFixed(1)}t` : `${totalVolume}kg`} volume
                </span>
              )}
            </div>
          )}
          {/* progress bar */}
          {totalCount > 0 && (
            <div className="mt-2 h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", workout.completed ? "bg-green-500" : "bg-violet-500")}
                style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => { e.preventDefault(); deleteMutation.mutate(workout.id) }}
            className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-red-400 active:text-red-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>
          <Link href={`/treinos/${workout.id}`} className="w-8 h-8 flex items-center justify-center text-white/40">
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
