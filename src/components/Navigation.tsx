"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarCheck,
  Dumbbell,
  Salad,
  Settings,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import SyncStatus from "./SyncStatus"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "./ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rotinas", label: "Rotinas", icon: CalendarCheck },
  { href: "/treinos", label: "Treinos", icon: Dumbbell },
  { href: "/dieta", label: "Dieta", icon: Salad },
  { href: "/settings", label: "Config", icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()

  return (
    <>
      {/* Top header */}
      <header className="fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-bold tracking-tight">DailyPulse</span>
        </div>
        <div className="flex items-center gap-3">
          <SyncStatus />
          {user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs text-muted-foreground">
              Sair
            </Button>
          )}
        </div>
      </header>

      {/* Bottom tab nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/80 backdrop-blur-sm pb-safe">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("h-5 w-5 transition-transform", active && "scale-110")}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className="text-[10px] font-medium leading-none truncate">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
