'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Play, Home, Calendar, TrendingUp, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEchoStore } from '@/store/echo-store'
import StartWorkoutSheet from '@/components/session/StartWorkoutSheet'

// The raised center circle is a pure action — start a workout — not a nav
// link. Creating/editing/organizing workouts lives on its own Treinos tab.
const leftTabs = [
  { href: '/inicio', label: 'Início', icon: Home, match: '/inicio' },
  { href: '/treinos', label: 'Treinos', icon: Calendar, match: '/treinos' },
]
const rightTabs = [
  { href: '/progresso', label: 'Progressão', icon: TrendingUp, match: '/progresso' },
  { href: '/rotinas', label: 'Rotina', icon: Repeat, match: '/rotinas' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const activeSession = useEchoStore((s) => s.activeSession)
  const [showStart, setShowStart] = useState(false)

  const renderTab = ({ href, label, icon: Icon, match }: (typeof leftTabs)[number]) => {
    const active = pathname.startsWith(match)
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          'flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Icon className={cn('h-5 w-5 transition-colors', active && 'text-primary')} strokeWidth={active ? 2.5 : 1.75} />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-lg items-center px-2 pb-safe pt-2">
        <div className="flex flex-1 items-center justify-evenly">{leftTabs.map(renderTab)}</div>
        <div className="w-16 shrink-0" />
        <div className="flex flex-1 items-center justify-evenly">{rightTabs.map(renderTab)}</div>
      </div>

      {/* Raised circular FAB, centered over the bar. No workout running:
          opens the quick-start sheet (today's workout, or pick another).
          Workout in progress: resumes it directly, switching to a darker
          "play" look instead of competing with primary. */}
      {activeSession ? (
        <Link
          href={
            activeSession.templateId
              ? `/treinos/${activeSession.templateId}/sessao`
              : '/treinos/livre/sessao'
          }
          aria-label="Retomar treino"
          className="-top-8 absolute left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-secondary text-primary shadow-lg shadow-black/40 ring-4 ring-background transition-transform active:scale-95"
        >
          <Play className="h-6 w-6 fill-primary" />
        </Link>
      ) : (
        <button
          onClick={() => setShowStart(true)}
          aria-label="Iniciar treino"
          className="-top-8 absolute left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/40 ring-4 ring-background transition-transform active:scale-95"
        >
          <Dumbbell className="h-6 w-6" strokeWidth={2} />
        </button>
      )}

      {showStart && <StartWorkoutSheet onClose={() => setShowStart(false)} />}
    </nav>
  )
}
