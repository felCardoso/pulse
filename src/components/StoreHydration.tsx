'use client'

import { useEffect } from 'react'
import { usePulseStore } from '@/store/pulse-store'

export default function StoreHydration() {
  useEffect(() => {
    usePulseStore.persist.rehydrate()
  }, [])
  return null
}
