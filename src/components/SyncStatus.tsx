"use client"

import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { Badge } from "@/components/ui/badge"

export default function SyncStatus() {
  const { isSyncing, pendingCount, isOnline } = useAppStore()

  if (isSyncing) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Sincronizando
      </Badge>
    )
  }

  if (!isOnline && pendingCount > 0) {
    return (
      <Badge variant="warning" className="gap-1.5">
        <AlertCircle className="h-3 w-3" />
        {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
      </Badge>
    )
  }

  if (pendingCount === 0) {
    return (
      <Badge variant="success" className="gap-1.5">
        <CheckCircle2 className="h-3 w-3" />
        Sincronizado
      </Badge>
    )
  }

  return null
}
