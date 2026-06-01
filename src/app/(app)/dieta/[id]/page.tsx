"use client"

import { useParams } from "next/navigation"
import { useMeals } from "@/hooks/useDiet"
import { formatDate } from "@/utils/date"
import { formatCalories, formatMacro } from "@/utils/numbers"

const mealTypeLabel: Record<string, string> = {
  breakfast: "Café da Manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
}

export default function DietaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: meals = [] } = useMeals()
  const meal = meals.find((m) => m.id === id)

  if (!meal) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Refeição não encontrada.
      </div>
    )
  }

  return (
    <div className="py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold">{meal.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mealTypeLabel[meal.mealType]} · {formatDate(meal.date)}
        </p>
        {meal.description && (
          <p className="text-sm text-muted-foreground mt-2">{meal.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Calorias", value: formatCalories(meal.calories) },
          { label: "Proteína", value: formatMacro(meal.protein) },
          { label: "Carboidratos", value: formatMacro(meal.carbs) },
          { label: "Gorduras", value: formatMacro(meal.fat) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
