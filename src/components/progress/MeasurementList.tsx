'use client'

import { useState } from 'react'
import { Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { usePulseStore } from '@/store/pulse-store'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import type { BodyMeasurement } from '@/types'

function formatDateBR(date: string): string {
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

export default function MeasurementList() {
  const bodyMeasurements = usePulseStore((s) => s.bodyMeasurements)
  const deleteBodyMeasurement = usePulseStore((s) => s.deleteBodyMeasurement)
  const bioimpedance = usePulseStore((s) => !!s.settings.bioimpedance)
  const weightUnit = usePulseStore((s) => s.settings.weightUnit)
  const [deleting, setDeleting] = useState<BodyMeasurement | null>(null)

  if (bodyMeasurements.length === 0) return null

  // Newest first for the list; store keeps ascending order.
  const items = [...bodyMeasurements].reverse()

  const deltaOf = (m: BodyMeasurement): number | null => {
    const idx = bodyMeasurements.findIndex((x) => x.id === m.id)
    if (idx <= 0) return null
    return Math.round((m.weightKg - bodyMeasurements[idx - 1].weightKg) * 10) / 10
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Registros
      </h2>
      {items.map((m) => {
        const delta = deltaOf(m)
        return (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {m.weightKg} {weightUnit}
                </p>
                {delta !== null && delta !== 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
                    {delta > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {delta > 0 ? '+' : ''}
                    {delta} {weightUnit}
                  </span>
                )}
                {delta === 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Minus className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                {formatDateBR(m.date)}
                {bioimpedance && m.bodyFatPct != null && ` · Gordura ${m.bodyFatPct}%`}
                {bioimpedance && m.musclePct != null && ` · Músculo ${m.musclePct}%`}
              </p>
            </div>
            <button
              onClick={() => setDeleting(m)}
              className="shrink-0 ml-3 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      })}

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir registro"
        description={
          deleting
            ? `Remover a medição de ${formatDateBR(deleting.date)} (${deleting.weightKg} ${weightUnit})?`
            : undefined
        }
        onConfirm={() => {
          if (deleting) deleteBodyMeasurement(deleting.id)
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
