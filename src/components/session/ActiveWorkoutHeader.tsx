'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { formatElapsed } from '@/utils/format'

interface Props {
  workoutName: string
  startedAt: string
  progress: { done: number; total: number }
  onCancel: () => void
}

export default function ActiveWorkoutHeader({ workoutName, startedAt, progress, onCancel }: Props) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const update = () => setElapsed(formatElapsed(startedAt))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-lg px-4">
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={onCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{workoutName}</p>
            <p className="text-xs text-muted-foreground">
              {elapsed} · {progress.done}/{progress.total} exercícios
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-secondary mb-3">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
