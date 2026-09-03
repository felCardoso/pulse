'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { usePulseStore } from '@/store/pulse-store'
import { formatDate } from '@/utils/format'

export default function RecordesPage() {
  const personalRecords = usePulseStore((s) => s.personalRecords)
  const weightUnit = usePulseStore((s) => s.settings.weightUnit)

  // Most recent achievements first.
  const records = Object.values(personalRecords).sort((a, b) =>
    b.achievedAt.localeCompare(a.achievedAt)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pt-2">
        <Link href="/inicio" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Recordes Pessoais</h1>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
            <Trophy className="h-7 w-7 text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhum recorde ainda</p>
            <p className="text-sm text-muted-foreground px-8">
              Complete séries com peso e reps para registrar seus recordes automaticamente
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((pr) => (
            <Link
              key={pr.exerciseName}
              href={`/treinos/exercicio/${encodeURIComponent(pr.exerciseName)}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {pr.exerciseName}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  Carga máx: <span className="font-heading font-semibold text-foreground">{pr.maxWeight}{weightUnit}</span>
                  {' · '}Volume máx: {Math.round(pr.maxVolume)}{weightUnit}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(pr.achievedAt)} · toque para ver a evolução
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
