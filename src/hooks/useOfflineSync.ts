"use client"

import { useEffect } from "react"
import { useOnlineStatus } from "./useOnlineStatus"
import { useAppStore } from "@/store/app-store"
import { OfflineSyncEngine } from "@/lib/sync/engine"

export function useOfflineSync() {
  const isOnline = useOnlineStatus()
  const { user, pendingCount, setOnline, setSyncing, setPendingCount } = useAppStore()

  useEffect(() => {
    setOnline(isOnline)
    if (isOnline && user?.id) {
      const engine = new OfflineSyncEngine(user.id)
      setSyncing(true)
      engine.syncAll().finally(() => setSyncing(false))
    }
  }, [isOnline, user?.id, setOnline, setSyncing])

  useEffect(() => {
    async function fetchPending() {
      if (!user?.id) return
      try {
        const res = await fetch(`/api/sync/pending?userId=${user.id}`)
        if (res.ok) {
          const { count } = await res.json()
          setPendingCount(count)
        }
      } catch {
        /* noop */
      }
    }
    fetchPending()
  }, [user?.id, setPendingCount])

  return { isOnline, hasPendingChanges: pendingCount > 0, pendingCount }
}
