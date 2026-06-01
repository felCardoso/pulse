export class OfflineSyncEngine {
  private userId: string
  private syncInProgress = false

  constructor(userId: string) {
    this.userId = userId
  }

  async queueOperation(
    operation: "create" | "update" | "delete",
    table: string,
    recordId: string,
    data: unknown
  ): Promise<void> {
    try {
      await fetch("/api/sync/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: this.userId,
          operation,
          table,
          recordId,
          data: JSON.stringify(data),
        }),
      })
    } catch {
      // If network is unavailable the mutation was already applied locally
    }
  }

  async syncAll(): Promise<void> {
    if (this.syncInProgress) return
    this.syncInProgress = true
    try {
      const res = await fetch(`/api/sync?userId=${this.userId}`, { method: "POST" })
      if (!res.ok) throw new Error("Sync failed")
    } finally {
      this.syncInProgress = false
    }
  }

  setupOnlineListener(onOnline: () => void, onOffline: () => void): () => void {
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }
}
