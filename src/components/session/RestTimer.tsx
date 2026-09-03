'use client'

import { useEffect, useRef, useState } from 'react'
import { SkipForward, Plus, Minus } from 'lucide-react'
import { usePulseStore } from '@/store/pulse-store'
import { useHaptic } from '@/hooks/useHaptic'
import { useSound } from '@/hooks/useSound'
import { requestNotificationPermission, notifyRestEnd } from '@/lib/notifications'
import { formatRestTime } from '@/utils/format'

const SIZE = 44
const STROKE = 4
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Global, non-blocking rest-timer pill. State lives in the store, so the
// countdown survives navigating to any tab (and even an app reload).
// Mounted once in the (app) layout.
export default function RestTimer() {
  const rest = usePulseStore((s) => s.rest)
  const stopRest = usePulseStore((s) => s.stopRest)
  const adjustRest = usePulseStore((s) => s.adjustRest)
  const activeSession = usePulseStore((s) => s.activeSession)

  const haptic = useHaptic()
  const sound = useSound()
  const [now, setNow] = useState(() => Date.now())
  const endedRef = useRef(false)

  const endsAt = rest?.endsAt

  useEffect(() => {
    if (!endsAt) return

    // Stale entry from a previous visit (e.g. app reopened long after the
    // rest ended): clear silently, without end-of-rest feedback.
    if (Date.now() > endsAt + 3000) {
      stopRest()
      return
    }

    requestNotificationPermission()
    endedRef.current = false
    let raf: number

    const end = () => {
      if (endedRef.current) return
      endedRef.current = true
      haptic.restEnd()
      sound.restEnd()
      notifyRestEnd()
      stopRest()
    }

    const tick = () => {
      setNow(Date.now())
      if (Date.now() < endsAt) {
        raf = requestAnimationFrame(tick)
      } else {
        end()
      }
    }

    raf = requestAnimationFrame(tick)
    // rAF pauses in background — this backup fires the end feedback (and
    // the local notification) even with the tab hidden.
    const timeout = setTimeout(end, Math.max(0, endsAt - Date.now()))

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeout)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [endsAt]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!rest) return null

  const timeLeft = Math.max(0, Math.ceil((rest.endsAt - now) / 1000))
  const progress = rest.totalSeconds > 0 ? timeLeft / rest.totalSeconds : 0
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(1, progress))

  // "Supino reto · série 3/4" — what comes after the rest. Warm-up sets
  // aren't counted in the X/Y (they're not part of the working-set total).
  const currentExercise = activeSession?.exercises.find((e) => !e.completed)
  const nextSet = currentExercise?.sets.find((s) => !s.done)
  const workingSetCount = currentExercise?.sets.filter((s) => !s.isWarmup).length ?? 0
  const nextLabel = currentExercise
    ? nextSet
      ? nextSet.isWarmup
        ? `${currentExercise.name} · aquecimento`
        : `${currentExercise.name} · série ${nextSet.setNumber}/${workingSetCount}`
      : currentExercise.name
    : undefined

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
            <span className="font-heading absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-foreground">
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
            onClick={() => adjustRest(-15)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70 active:scale-95"
            aria-label="Diminuir 15 segundos"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => adjustRest(15)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70 active:scale-95"
            aria-label="Aumentar 15 segundos"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Skip */}
          <button
            onClick={stopRest}
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
