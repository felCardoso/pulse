'use client'

import { useEchoStore } from '@/store/echo-store'

export function useHaptic() {
  const hapticEnabled = useEchoStore((s) => s.settings.hapticEnabled)

  const vibrate = (pattern: number | number[]) => {
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }

  return {
    tap: () => vibrate(10),
    success: () => vibrate([20, 10, 20]),
    restEnd: () => vibrate([50, 30, 80, 30, 50]),
    pr: () => vibrate([30, 20, 30, 20, 60]),
    /** Short, sharp double buzz — Rest-Pause's silent end-of-rest cue. */
    restPauseEnd: () => vibrate([70, 60, 70]),
  }
}
