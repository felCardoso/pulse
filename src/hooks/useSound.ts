'use client'

import { usePulseStore } from '@/store/pulse-store'
import { playRestEndSound, playSetDoneSound } from '@/lib/audio'

export function useSound() {
  const soundEnabled = usePulseStore((s) => s.settings.soundEnabled)

  return {
    setDone: () => { if (soundEnabled) playSetDoneSound() },
    restEnd: () => { if (soundEnabled) playRestEndSound() },
  }
}
