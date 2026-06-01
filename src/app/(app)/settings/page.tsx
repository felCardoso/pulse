"use client"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Smartphone } from "lucide-react"

export default function SettingsPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="py-6 space-y-5">
      <h1 className="text-xl font-bold">Configurações</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">E-mail</p>
            <p className="text-sm font-medium">{user?.email ?? "—"}</p>
          </div>
          {user?.name && (
            <div>
              <p className="text-xs text-muted-foreground">Nome</p>
              <p className="text-sm font-medium">{user.name}</p>
            </div>
          )}
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            DailyPulse v1.0.0 — Offline-first PWA
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Instale o app na sua tela inicial para a melhor experiência.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
