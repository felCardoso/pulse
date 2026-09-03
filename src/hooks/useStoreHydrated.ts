'use client'

import { useEffect, useState } from 'react'
import { useEchoStore } from '@/store/echo-store'

/**
 * True once the persisted store has finished rehydrating from localStorage
 * (skipHydration: true, manually triggered by <StoreHydration>). Gate any
 * effect or render that reads store data on this to avoid acting on the
 * pre-hydration empty state.
 */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    if (useEchoStore.persist?.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useEchoStore.persist?.onFinishHydration(() => setHydrated(true))
  }, [])
  return hydrated
}
