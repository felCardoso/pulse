'use client'

import { useState } from 'react'
import { X, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'

interface Props {
  onClose: () => void
}

export default function WeightGoalSheet({ onClose }: Props) {
  const weightGoalKg = usePulseStore((s) => s.weightGoalKg)
  const setWeightGoal = usePulseStore((s) => s.setWeightGoal)
  const weightUnit = usePulseStore((s) => s.settings.weightUnit)
  const latest = usePulseStore((s) => s.bodyMeasurements[s.bodyMeasurements.length - 1])

  const [goal, setGoal] = useState(weightGoalKg != null ? String(weightGoalKg) : '')

  const goalNum = parseFloat(goal)
  const valid = goal !== '' && !isNaN(goalNum) && goalNum > 0

  const handleSave = () => {
    if (!valid) return
    setWeightGoal(Math.round(goalNum * 10) / 10)
    onClose()
  }

  const handleRemove = () => {
    setWeightGoal(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-2xl border-t border-border p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Meta de peso</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          A meta aparece como linha no gráfico e mostra quanto falta a cada medição.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Peso alvo ({weightUnit})
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder={latest ? String(latest.weightKg) : '75.0'}
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-center text-lg font-semibold tabular-nums placeholder:text-muted-foreground placeholder:font-normal focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          {weightGoalKg != null && (
            <Button
              variant="outline"
              onClick={handleRemove}
              className="gap-1.5 text-destructive hover:text-destructive border-destructive/30"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!valid} className="flex-1 gap-2">
            <Check className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}
