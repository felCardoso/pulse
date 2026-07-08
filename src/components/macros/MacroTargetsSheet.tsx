'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'

interface Props {
  onClose: () => void
}

export default function MacroTargetsSheet({ onClose }: Props) {
  const macroTargets = usePulseStore((s) => s.macroTargets)
  const updateMacroTargets = usePulseStore((s) => s.updateMacroTargets)

  const [kcal, setKcal] = useState(String(macroTargets.kcal))
  const [protein, setProtein] = useState(String(macroTargets.protein))
  const [carbs, setCarbs] = useState(String(macroTargets.carbs))
  const [fat, setFat] = useState(String(macroTargets.fat))

  const parse = (v: string) => {
    const n = parseFloat(v)
    return !isNaN(n) && n > 0 ? n : null
  }

  const kcalNum = parse(kcal)
  const proteinNum = parse(protein)
  const carbsNum = parse(carbs)
  const fatNum = parse(fat)
  const valid = kcalNum !== null && proteinNum !== null && carbsNum !== null && fatNum !== null

  // 4 kcal/g for protein and carbs, 9 kcal/g for fat.
  const estimatedKcal =
    proteinNum !== null && carbsNum !== null && fatNum !== null
      ? Math.round(proteinNum * 4 + carbsNum * 4 + fatNum * 9)
      : null

  const handleSave = () => {
    if (!valid) return
    updateMacroTargets({
      kcal: Math.round(kcalNum),
      protein: Math.round(proteinNum * 10) / 10,
      carbs: Math.round(carbsNum * 10) / 10,
      fat: Math.round(fatNum * 10) / 10,
    })
    onClose()
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-center tabular-nums placeholder:text-muted-foreground focus:border-primary focus:outline-none'

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-2xl border-t border-border p-4 space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Metas diárias</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Defina suas metas de calorias e macronutrientes. A barra de progresso e o
          resumo do dia usam esses valores.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Calorias (kcal)</label>
          <input
            type="number"
            inputMode="numeric"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            placeholder="2900"
            className={`${inputClass} text-lg font-semibold`}
          />
          {estimatedKcal !== null && Math.abs(estimatedKcal - (kcalNum ?? 0)) > 50 && (
            <button
              onClick={() => setKcal(String(estimatedKcal))}
              className="text-xs text-primary hover:underline"
            >
              Pelos macros abaixo: ~{estimatedKcal} kcal — usar esse valor
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Proteína (g)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="230"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Carbs (g)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="290"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Gordura (g)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="97"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!valid} className="flex-1 gap-2">
            <Check className="h-4 w-4" />
            Salvar metas
          </Button>
        </div>
      </div>
    </div>
  )
}
