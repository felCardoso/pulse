'use client'

import { useEffect } from 'react'
import { SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHaptic } from '@/hooks/useHaptic'
import { useSound } from '@/hooks/useSound'
import { useRestTimer } from '@/hooks/useRestTimer'
import { formatRestTime } from '@/utils/format'

const SIZE = 180
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Props {
  seconds: number
  isActive: boolean
  onEnd: () => void
  onSkip: () => void
}

export default function RestTimer({ seconds, isActive, onEnd, onSkip }: Props) {
  const haptic = useHaptic()
  const sound = useSound()

  const handleEnd = () => {
    haptic.restEnd()
    sound.restEnd()
    onEnd()
  }

  const { timeLeft, totalSeconds, start, skip } = useRestTimer(handleEnd)

  useEffect(() => {
    if (isActive && seconds > 0) {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl border-t border-border bg-background px-6 pb-safe pt-6 space-y-6">
        <div className="mx-auto h-1 w-12 rounded-full bg-border" />

        <p className="text-center text-sm font-medium text-muted-foreground">Descansando...</p>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <svg width={SIZE} height={SIZE} className="-rotate-90">
              {/* Track */}
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth={STROKE}
              />
              {/* Progress */}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums text-foreground">
                {formatRestTime(timeLeft)}
              </span>
              <span className="text-xs text-muted-foreground">restante</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleSkip}
        >
          <SkipForward className="h-4 w-4" />
          Pular Descanso
        </Button>
      </div>
    </div>
  )
}
