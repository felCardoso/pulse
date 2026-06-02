"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Dumbbell,
  Salad,
  MoreHorizontal,
  Zap,
  CalendarCheck,
  CheckSquare,
  Repeat2,
  StickyNote,
  Target,
  Timer,
  Settings,
  X,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import SyncStatus from "./SyncStatus"
import { useAuth } from "@/hooks/useAuth"

const mainTabs = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/treinos", label: "Treinos", icon: Dumbbell },
  { href: "/dieta", label: "Dieta", icon: Salad },
]

const moreLinks = [
  { href: "/rotinas", label: "Rotinas", icon: CalendarCheck },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/habitos", label: "Hábitos", icon: Repeat2 },
  { href: "/notas", label: "Notas", icon: StickyNote },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/settings", label: "Config", icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)

  const moreActive = moreLinks.some(
    (l) => pathname === l.href || pathname.startsWith(l.href + "/")
  )

  return (
    <>
      {/* Top header */}
      <header className="fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-white/8 bg-black/80 backdrop-blur-sm px-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-violet-400" />
          <span className="font-bold tracking-tight">DailyPulse</span>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatus />
        </div>
      </header>

      {/* More bottom sheet */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-[#0f0f0f] border-t border-white/10 rounded-t-2xl p-5 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-sm text-white/50 uppercase tracking-wider">Mais</span>
              <button onClick={() => setMoreOpen(false)} className="text-white/40 hover:text-white/70 p-1">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {moreLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                      active
                        ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                        : "bg-white/3 border-white/8 text-white/55 active:bg-white/10"
                    )}
                  >
                    <Icon size={20} />
                    <span className="text-[10px] font-medium leading-none">{label}</span>
                  </Link>
                )
              })}
            </div>
            <button
              onClick={signOut}
              className="mt-5 w-full py-2.5 text-sm text-white/25 hover:text-white/50 transition-colors"
            >
              Sair da conta
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab nav */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t border-white/8 bg-black/90 backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-2 py-1">
          {mainTabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl transition-all min-w-0 active:scale-95",
                  active ? "text-violet-400" : "text-white/35 active:text-white/70"
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

          {/* Center FAB — new workout */}
          <Link
            href="/treinos/new"
            className="flex flex-col items-center gap-0.5 -mt-5"
          >
            <div className="w-14 h-14 rounded-full bg-violet-500 hover:bg-violet-600 active:scale-95 flex items-center justify-center shadow-lg shadow-violet-500/30 transition-all border-4 border-black">
              <Plus size={22} className="text-white" />
            </div>
            <span className="text-[9px] font-medium text-white/30 mt-0.5">Treino</span>
          </Link>

          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl transition-all active:scale-95",
              moreActive ? "text-violet-400" : "text-white/35"
            )}
          >
            <MoreHorizontal
              className={cn("h-5 w-5", moreActive && "scale-110")}
              strokeWidth={moreActive ? 2.5 : 1.8}
            />
            <span className="text-[10px] font-medium leading-none">Mais</span>
          </button>
        </div>
      </nav>
    </>
  )
}
