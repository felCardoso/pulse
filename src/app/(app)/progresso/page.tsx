'use client'

import { useState } from 'react'
import { Plus, Scale, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import WeightChart from '@/components/progress/WeightChart'
import MeasurementSheet from '@/components/progress/MeasurementSheet'
import MeasurementList from '@/components/progress/MeasurementList'

const BIO_CARDS = [
  { key: 'bodyFatPct', label: 'Gordura', unit: '%' },
  { key: 'musclePct', label: 'Músculo', unit: '%' },
  { key: 'waterPct', label: 'Água', unit: '%' },
  { key: 'visceralFat', label: 'Visceral', unit: '' },
] as const

export default function ProgressoPage() {
  const bodyMeasurements = usePulseStore((s) => s.bodyMeasurements)
  const bioimpedance = usePulseStore((s) => !!s.settings.bioimpedance)
  const weightUnit = usePulseStore((s) => s.settings.weightUnit)
  const [showSheet, setShowSheet] = useState(false)

  const latest = bodyMeasurements[bodyMeasurements.length - 1]
  const previous = bodyMeasurements[bodyMeasurements.length - 2]
  const first = bodyMeasurements[0]

  const weightDelta = latest && previous
    ? Math.round((latest.weightKg - previous.weightKg) * 10) / 10
    : null
  const totalDelta = latest && first && latest.id !== first.id
    ? Math.round((latest.weightKg - first.weightKg) * 10) / 10
    : null

  // Weekly reminder: nudge when the latest entry is 7+ days old.
  const daysSinceLast = latest
    ? Math.floor((Date.now() - new Date(`${latest.date}T12:00:00`).getTime()) / 86400000)
    : null
  const needsWeighIn = !latest || (daysSinceLast !== null && daysSinceLast >= 7)

  const chartPoints = bodyMeasurements.slice(-12).map((m) => ({
    date: m.date,
    value: m.weightKg,
  }))

  const fmtDelta = (d: number) => `${d > 0 ? '+' : ''}${d} ${weightUnit}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-foreground">Progresso</h1>
        <Button size="sm" onClick={() => setShowSheet(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Registrar
        </Button>
      </div>

      {/* Weekly weigh-in reminder */}
      {needsWeighIn && (
        <button
          onClick={() => setShowSheet(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3.5 text-left transition-colors hover:bg-primary/15"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">Registro semanal</p>
            <p className="text-xs text-primary/70">
              {latest
                ? `Última medição há ${daysSinceLast} dias — hora de se pesar!`
                : 'Registre seu peso para começar a acompanhar'}
            </p>
          </div>
        </button>
      )}

      {/* Empty state */}
      {!latest && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Scale className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhuma medição ainda</p>
            <p className="text-sm text-muted-foreground px-8">
              Registre seu peso semanalmente para acompanhar sua evolução corporal
            </p>
          </div>
          <Button onClick={() => setShowSheet(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Primeira medição
          </Button>
        </div>
      )}

      {/* Current weight + deltas */}
      {latest && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Peso atual</p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {latest.weightKg}
              <span className="text-base text-muted-foreground font-normal ml-1">{weightUnit}</span>
            </p>
            <div className="text-right text-xs text-muted-foreground tabular-nums">
              {weightDelta !== null && (
                <p>
                  vs anterior:{' '}
                  <span className="font-semibold text-foreground">{fmtDelta(weightDelta)}</span>
                </p>
              )}
              {totalDelta !== null && (
                <p>
                  total:{' '}
                  <span className="font-semibold text-foreground">{fmtDelta(totalDelta)}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weight chart */}
      {chartPoints.length > 1 && <WeightChart points={chartPoints} unit={weightUnit} />}

      {/* Bioimpedance cards */}
      {bioimpedance && latest && (
        <div className="grid grid-cols-4 divide-x divide-border rounded-xl border border-border bg-card">
          {BIO_CARDS.map((card) => {
            const value = latest[card.key]
            const prev = previous?.[card.key]
            const delta =
              value != null && prev != null
                ? Math.round((value - prev) * 10) / 10
                : null
            return (
              <div key={card.key} className="px-2 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-0.5 text-base font-bold text-foreground tabular-nums">
                  {value != null ? `${value}${card.unit}` : '—'}
                </p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  {delta != null && delta !== 0
                    ? `${delta > 0 ? '+' : ''}${delta}${card.unit}`
                    : ' '}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* History */}
      <MeasurementList />

      {showSheet && <MeasurementSheet onClose={() => setShowSheet(false)} />}
    </div>
  )
}
