"use client"

import { Trash2, Utensils } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCalories } from "@/utils/numbers"
import type { Meal } from "@/types"
import { useDeleteMeal } from "@/hooks/useDiet"

const mealTypeLabel: Record<string, string> = {
  breakfast: "Café da Manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
}

interface Props {
  meal: Meal
}

export default function MealCard({ meal }: Props) {
  const deleteMutation = useDeleteMeal()

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Utensils className="h-5 w-5 text-emerald-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm">{meal.name}</p>
            <Badge variant="secondary" className="text-[10px]">
              {mealTypeLabel[meal.mealType] ?? meal.mealType}
            </Badge>
          </div>
          {meal.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meal.description}</p>
          )}
          <div className="flex gap-3 mt-2 flex-wrap">
            <span className="text-xs font-medium text-primary">{formatCalories(meal.calories)}</span>
            {meal.protein != null && (
              <span className="text-xs text-muted-foreground">P: {meal.protein}g</span>
            )}
            {meal.carbs != null && (
              <span className="text-xs text-muted-foreground">C: {meal.carbs}g</span>
            )}
            {meal.fat != null && (
              <span className="text-xs text-muted-foreground">G: {meal.fat}g</span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
          onClick={() => deleteMutation.mutate(meal.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
