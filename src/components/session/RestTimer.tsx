'use client'

import { useEffect } from 'react'
import { SkipForward, Plus, Minus } from 'lucide-react'
import { useHaptic } from '@/hooks/useHaptic'
import { useSound } from '@/hooks/useSound'
import { useRestTimer } from '@/hooks/useRestTimer'
import { requestNotificationPermission, notifyRestEnd } from '@/lib/notifications'
import { formatRestTime } from '@/utils/format'

const SIZE = 44
const STROKE = 4
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Props {
  seconds: number
  isActive: boolean
  onEnd: () => void
  onSkip: () => void
  /** e.g. "Supino reto · série 3/4" — shown so the user knows what's next */
  nextLabel?: string
}

// Compact floating pill — does NOT block the screen, so the user can
// browse exercises and pre-fill the next set while resting.
export default function RestTimer({ seconds, isActive, onEnd, onSkip, nextLabel }: Props) {
  const haptic = useHaptic()
  const sound = useSound()

  const handleEnd = () => {
    haptic.restEnd()
    sound.restEnd()
    notifyRestEnd()
    onEnd()
  }

  const { timeLeft, totalSeconds, start, skip, addTime } = useRestTimer(handleEnd)

  useEffect(() => {
    if (isActive && seconds > 0) {
      // Piggyback on the ✓-tap gesture to ask for notification permission.
      requestNotificationPermission()
      start(seconds)
    }
  }, [isActive, seconds]) // eslint-disable-line react-hooks/exhaustive-deps

  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 0
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  const handleSkip = () => {
    skip()
    onSkip()
  }

  if (!isActive) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      // Sits above the bottom nav (z-40, ~4rem tall) so the countdown is
      // never covered by it on mobile.
      style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-primary/30 bg-background/95 shadow-lg shadow-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Mini progress ring with countdown */}
          <div className="relative shrink-0">
            <svg width={SIZE} height={SIZE} className="-rotate-90">
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth={STROKE}
              />
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-foreground">
              {formatRestTime(timeLeft)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Descansando</p>
            {nextLabel && (
              <p className="truncate text-xs text-foreground">
                Próxima: <span className="font-medium">{nextLabel}</span>
              </p>
            )}
          </div>

          {/* −15s / +15s */}
          <button
            onClick={() => addTime(-15)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70 active:scale-95"
            aria-label="Diminuir 15 segundos"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => addTime(15)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70 active:scale-95"
            aria-label="Aumentar 15 segundos"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
            aria-label="Pular descanso"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
