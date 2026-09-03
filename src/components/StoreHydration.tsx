'use client'

import { useEffect } from 'react'
import { useEchoStore } from '@/store/echo-store'

export default function StoreHydration() {
  useEffect(() => {
    useEchoStore.persist.rehydrate()
  }, [])
  return null
}
