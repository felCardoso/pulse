'use client'

import Link from 'next/link'
import { ChevronRight, Clock, Dumbbell } from 'lucide-react'
import { formatDuration, calcTotalVolume } from '@/utils/format'
import type { WorkoutSession } from '@/types'

interface Props {
  session: WorkoutSession
}

export default function SessionCard({ session }: Props) {
  const volume = calcTotalVolume(session.exercises)
  const completed = session.exercises.filter((e) => e.completed).length

  return (
    <Link
      href={`/historico/${session.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40 active:bg-card/80"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
        <Dumbbell className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{session.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {session.duration != null && (
            <>
              <Clock className="h-3 w-3" />
              <span>{formatDuration(session.duration)}</span>
              <span>·</span>
            </>
          )}
          <span>{completed} exercícios</span>
          {volume > 0 && (
            <>
              <span>·</span>
              <span>{Math.round(volume)}kg</span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
