'use client'

import { usePulseStore } from '@/store/pulse-store'

interface Props {
  selectedFoodId: string | null
  onSelectFood: (id: string) => void
}

export default function SavedFoodsList({ selectedFoodId, onSelectFood }: Props) {
  const foods = usePulseStore((s) => s.foods)

  if (foods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">
          Nenhum alimento salvo. Crie um na aba "Manual" ou acesse as configurações para gerenciar alimentos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {foods.map((food) => (
        <button
          key={food.id}
          onClick={() => onSelectFood(food.id)}
          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
            selectedFoodId === food.id
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <p className="text-sm font-medium text-foreground">{food.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {food.kcalPer100g} kcal · P: {food.proteinPer100g}g · C: {food.carbsPer100g}g · G: {food.fatPer100g}g
          </p>
        </button>
      ))}
    </div>
  )
}
