'use client'

import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import SavedFoodsList from './SavedFoodsList'
import ManualFoodForm from './ManualFoodForm'

interface Props {
  onClose: () => void
}

type Tab = 'saved' | 'manual'

// Digits-only time mask: "1430" -> "14:30" (":" inserted automatically).
function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export default function AddMealSheet({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('saved')
  const [grams, setGrams] = useState<string>('100')
  const [time, setTime] = useState<string>('')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const logMeal = usePulseStore((s) => s.logMeal)

  // Current time as the default/placeholder (computed once per open).
  const nowPlaceholder = useMemo(
    () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    []
  )

  const timeValid = time === '' || TIME_RE.test(time)

  const handleAddMeal = () => {
    if (!selectedFoodId || !grams || !timeValid) return
    const gramsNum = parseFloat(grams)
    if (isNaN(gramsNum) || gramsNum <= 0) return

    // Empty input = now (the placeholder time).
    const log = logMeal(selectedFoodId, gramsNum, time || undefined)
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

        {/* Grams + time inputs (if food selected) */}
        {selectedFoodId && (
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Quantidade (g)
                </label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Horário
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={time}
                  onChange={(e) => setTime(formatTimeInput(e.target.value))}
                  placeholder={nowPlaceholder}
                  maxLength={5}
                  className={`w-full px-3 py-2 rounded-lg border bg-secondary text-foreground text-center tabular-nums placeholder:text-muted-foreground focus:outline-none ${
                    timeValid ? 'border-border focus:border-primary' : 'border-destructive'
                  }`}
                />
              </div>
            </div>
            {!timeValid && (
              <p className="text-xs text-destructive">Horário inválido (use HH:MM, ex: 08:30)</p>
            )}
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
            disabled={!selectedFoodId || !grams || !timeValid}
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
