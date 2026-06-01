"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import WorkoutList from "@/components/Workouts/WorkoutList"
import { useWorkouts } from "@/hooks/useWorkout"

export default function TreinosPage() {
  const { data: workouts = [], isLoading } = useWorkouts()

  return (
    <div className="py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Treinos</h1>
        <Link href="/treinos/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <WorkoutList workouts={workouts} />
      )}
    </div>
  )
}
