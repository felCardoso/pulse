"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import MealList from "@/components/Diet/MealList"
import NutritionStats from "@/components/Diet/NutritionStats"
import { useMeals } from "@/hooks/useDiet"
import { isToday } from "@/utils/date"

export default function DietaPage() {
  const { data: meals = [], isLoading } = useMeals()
  const todayMeals = meals.filter((m) => isToday(m.date))

  return (
    <div className="py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dieta</h1>
        <Link href="/dieta/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </Link>
      </div>

      <NutritionStats meals={todayMeals} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <MealList meals={meals} />
      )}
    </div>
  )
}
