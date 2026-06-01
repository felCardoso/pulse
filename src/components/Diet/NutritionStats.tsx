"use client"

import { Card, CardContent } from "@/components/ui/card"
import { sum } from "@/utils/numbers"
import type { Meal } from "@/types"

interface Props {
  meals: Meal[]
}

export default function NutritionStats({ meals }: Props) {
  const totalCal = sum(meals.map((m) => m.calories))
  const totalProt = sum(meals.map((m) => m.protein))
  const totalCarbs = sum(meals.map((m) => m.carbs))
  const totalFat = sum(meals.map((m) => m.fat))

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
          Resumo de Hoje
        </p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-primary">{Math.round(totalCal)}</p>
            <p className="text-[10px] text-muted-foreground">kcal</p>
          </div>
          <div>
            <p className="text-lg font-bold">{Math.round(totalProt)}g</p>
            <p className="text-[10px] text-muted-foreground">Proteína</p>
          </div>
          <div>
            <p className="text-lg font-bold">{Math.round(totalCarbs)}g</p>
            <p className="text-[10px] text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-lg font-bold">{Math.round(totalFat)}g</p>
            <p className="text-[10px] text-muted-foreground">Gordura</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
