"use client"

import MealCard from "./MealCard"
import type { Meal } from "@/types"

interface Props {
  meals: Meal[]
}

export default function MealList({ meals }: Props) {
  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">Nenhuma refeição registrada.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {meals.map((m) => (
        <MealCard key={m.id} meal={m} />
      ))}
    </div>
  )
}
