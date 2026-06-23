'use client'

import { useState, useRef } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import SavedFoodsList from './SavedFoodsList'
import ManualFoodForm from './ManualFoodForm'

interface Props {
  onClose: () => void
}

type Tab = 'saved' | 'manual' | 'search'

export default function AddMealSheet({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('saved')
  const [grams, setGrams] = useState<string>('100')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const foods = usePulseStore((s) => s.foods)
  const logMeal = usePulseStore((s) => s.logMeal)

  const handleAddMeal = () => {
    if (!selectedFoodId || !grams) return
    const gramsNum = parseFloat(grams)
    if (isNaN(gramsNum) || gramsNum <= 0) return

    const log = logMeal(selectedFoodId, gramsNum)
    if (log) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full bg-background rounded-t-2xl border-t border-border p-4 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Adicionar refeição</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setTab('saved')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'saved'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Salvos
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'manual'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Manual
          </button>
        </div>

        {/* Tab content */}
        {tab === 'saved' && (
          <SavedFoodsList
            selectedFoodId={selectedFoodId}
            onSelectFood={setSelectedFoodId}
          />
        )}

        {tab === 'manual' && (
          <ManualFoodForm
            onFoodAdded={(foodId) => setSelectedFoodId(foodId)}
          />
        )}

        {/* Grams input (if food selected) */}
        {selectedFoodId && (
          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-sm font-medium text-foreground">
              Quantidade (gramas)
            </label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="100"
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddMeal}
            disabled={!selectedFoodId || !grams}
            className="flex-1 gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}
