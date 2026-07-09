'use client'

import { useEffect } from 'react'

// Keeps the screen awake while `active` is true (e.g. during a workout).
// The lock is silently re-acquired when the tab becomes visible again,
// since the browser releases it on backgrounding.
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        if (!('wakeLock' in navigator)) return
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          lock.release().catch(() => {})
        } else {
          sentinel = lock
        }
      } catch {
        // Unsupported or denied (e.g. low battery) — not critical.
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      sentinel?.release().catch(() => {})
      sentinel = null
    }
  }, [active])
}
