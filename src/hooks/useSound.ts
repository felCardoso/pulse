'use client'

import { useEchoStore } from '@/store/echo-store'
import { playRestEndSound, playSetDoneSound, playPRSound } from '@/lib/audio'

export function useSound() {
  const soundEnabled = useEchoStore((s) => s.settings.soundEnabled)

  return {
    setDone: () => { if (soundEnabled) playSetDoneSound() },
    restEnd: () => { if (soundEnabled) playRestEndSound() },
    pr: () => { if (soundEnabled) playPRSound() },
  }
}
