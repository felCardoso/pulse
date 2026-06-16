'use client'

import { usePulseStore } from '@/store/pulse-store'

export function useHaptic() {
  const hapticEnabled = usePulseStore((s) => s.settings.hapticEnabled)

  const vibrate = (pattern: number | number[]) => {
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }

  return {
    tap: () => vibrate(10),
    success: () => vibrate([20, 10, 20]),
    restEnd: () => vibrate([50, 30, 80, 30, 50]),
  }
}
