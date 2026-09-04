'use client'

import { useEffect, useRef, useState } from 'react'
import { SkipForward, Plus, Minus } from 'lucide-react'
import { useEchoStore } from '@/store/echo-store'
import { useHaptic } from '@/hooks/useHaptic'
import { useSound } from '@/hooks/useSound'
import { useLongPress } from '@/hooks/useLongPress'
import { requestNotificationPermission, notifyRestEnd } from '@/lib/notifications'
import { formatRestTime } from '@/utils/format'

const SIZE = 44
const STROKE = 4
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Global, non-blocking rest-timer pill (or, in Focus Mode, a full-screen
// takeover). State lives in the store, so the countdown survives navigating
// to any tab (and even an app reload). Mounted once in the (app) layout.
export default function RestTimer() {
  const rest = useEchoStore((s) => s.rest)
  const stopRest = useEchoStore((s) => s.stopRest)
  const adjustRest = useEchoStore((s) => s.adjustRest)
  const pauseRest = useEchoStore((s) => s.pauseRest)
  const resumeRest = useEchoStore((s) => s.resumeRest)
  const activeSession = useEchoStore((s) => s.activeSession)
  const focusModeEnabled = useEchoStore((s) => s.settings.focusModeEnabled)

  const haptic = useHaptic()
  const sound = useSound()
  const [now, setNow] = useState(() => Date.now())
  const endedRef = useRef(false)

  const endsAt = rest?.endsAt
  const isRestPause = rest?.isRestPause
  const isPaused = rest?.pausedRemainingMs != null

  useEffect(() => {
    if (!endsAt || isPaused) return

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
      // Rest-Pause: silent — a short double buzz instead of the alarm sound.
      if (isRestPause) {
        haptic.restPauseEnd()
      } else {
        haptic.restEnd()
        sound.restEnd()
      }
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
  }, [endsAt, isPaused]) // eslint-disable-line react-hooks/exhaustive-deps

  const focusPress = useLongPress(
    () => {
      haptic.success()
      stopRest()
    },
    () => {
      if (isPaused) resumeRest()
      else pauseRest()
    },
    550
  )

  if (!rest) return null

  const timeLeft = isPaused
    ? Math.ceil((rest.pausedRemainingMs as number) / 1000)
    : Math.max(0, Math.ceil((rest.endsAt - now) / 1000))
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
        : isRestPause
        ? `${currentExercise.name} · burst ${nextSet.setNumber}`
        : `${currentExercise.name} · série ${nextSet.setNumber}/${workingSetCount}`
      : currentExercise.name
    : undefined

  // Focus Mode: the interface goes away entirely — just a black screen and
  // a giant countdown. Tap the middle to pause/resume, hold it to skip the
  // rest; small discrete buttons at the bottom adjust the time.
  if (focusModeEnabled) {
    return (
      <div className="fixed inset-0 z-[80] flex flex-col bg-black animate-fade-in">
        <div
          {...focusPress}
          className="flex w-full flex-1 select-none flex-col items-center justify-center gap-3 px-8"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="font-heading text-[5rem] font-bold leading-none tabular-nums text-primary sm:text-[7rem]">
            {formatRestTime(timeLeft)}
          </span>
          <span className="text-[11px] uppercase tracking-widest text-white/40">
            {isPaused ? 'pausado · toque para retomar' : 'toque para pausar · segure para pular'}
          </span>
          {nextLabel && (
            <p className="mt-2 text-sm text-white/40">
              Próxima: <span className="text-white/70">{nextLabel}</span>
            </p>
          )}
        </div>

        {/* Discrete time adjustment — tucked at the bottom, out of the tap/hold zone */}
        <div className="mb-10 flex w-full items-center justify-center gap-8">
          <button
            onClick={() => adjustRest(-10)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white/30 transition-colors hover:text-white/70 active:scale-95"
            aria-label="Diminuir 10 segundos"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            onClick={() => adjustRest(10)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white/30 transition-colors hover:text-white/70 active:scale-95"
            aria-label="Aumentar 10 segundos"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      // Sits above the bottom nav (z-40, ~4rem tall) so the countdown is
      // never covered by it on mobile.
      style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="pointer-events-auto w-full max-w-lg animate-fade-in-up rounded-2xl border border-primary/30 bg-background/95 shadow-lg shadow-black/40 backdrop-blur-md">
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
            <p className="text-xs font-medium text-muted-foreground">
              {isRestPause ? 'Rest-Pause · silencioso' : 'Descansando'}
            </p>
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
