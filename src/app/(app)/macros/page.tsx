'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import AddMealSheet from '@/components/macros/AddMealSheet'
import MacroProgressBar from '@/components/macros/MacroProgressBar'
import DayMacroSummary from '@/components/macros/DayMacroSummary'
import MealLog from '@/components/macros/MealLog'

export default function MacrosPage() {
  const [showAddMeal, setShowAddMeal] = useState(false)
  const getDayTotals = usePulseStore((s) => s.getDayTotals)
  const cleanupOldFoods = usePulseStore((s) => s.cleanupOldFoods)
  const macroTargets = usePulseStore((s) => s.macroTargets)
  const { kcal, protein, carbs, fat, logs } = getDayTotals()

  useEffect(() => {
    cleanupOldFoods()
  }, [cleanupOldFoods])

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-foreground">Macros</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Main progress bar */}
      <MacroProgressBar
        current={kcal}
        target={macroTargets.kcal}
      />

      {/* Macro summary cards */}
      <DayMacroSummary
        kcal={{ current: kcal, target: macroTargets.kcal }}
        protein={{ current: protein, target: macroTargets.protein }}
        carbs={{ current: carbs, target: macroTargets.carbs }}
        fat={{ current: fat, target: macroTargets.fat }}
      />

      {/* Add meal button */}
      <Button
        onClick={() => setShowAddMeal(true)}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        Adicionar refeição
      </Button>

      {/* Meal log */}
      <MealLog logs={logs} />

      {/* Add meal sheet */}
      {showAddMeal && (
        <AddMealSheet
          onClose={() => setShowAddMeal(false)}
        />
      )}
    </div>
  )
}
