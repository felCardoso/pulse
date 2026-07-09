'use client'

import { useState, useEffect } from 'react'
import { Plus, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import AddMealSheet from '@/components/macros/AddMealSheet'
import MacroProgressBar from '@/components/macros/MacroProgressBar'
import MacroTargetsSheet from '@/components/macros/MacroTargetsSheet'
import DayMacroSummary from '@/components/macros/DayMacroSummary'
import QuickAddFoods from '@/components/macros/QuickAddFoods'
import MealLog from '@/components/macros/MealLog'

export default function MacrosPage() {
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [showTargets, setShowTargets] = useState(false)
  const getDayTotals = usePulseStore((s) => s.getDayTotals)
  const cleanupOldFoods = usePulseStore((s) => s.cleanupOldFoods)
  const macroTargets = usePulseStore((s) => s.macroTargets)
  // Subscribe to the raw logs so the page re-renders (and totals recompute)
  // whenever a meal is added or removed.
  usePulseStore((s) => s.dailyMacroLogs)
  const { kcal, protein, carbs, fat, logs } = getDayTotals()

  useEffect(() => {
    cleanupOldFoods()
  }, [cleanupOldFoods])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Macros</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowTargets(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          aria-label="Editar metas diárias"
          title="Metas diárias"
        >
          <UserCog className="h-[18px] w-[18px]" />
        </button>
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

      {/* One-tap quick add (most used foods + repeat last meal) */}
      <QuickAddFoods />

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

      {/* Targets profile sheet */}
      {showTargets && <MacroTargetsSheet onClose={() => setShowTargets(false)} />}
    </div>
  )
}
