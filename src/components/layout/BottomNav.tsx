'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Play, TrendingUp, Settings, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePulseStore } from '@/store/pulse-store'

// Treinos gets the raised center circle — it's the app's primary action.
const leftTabs = [
  { href: '/rotinas', label: 'Rotinas', icon: Repeat, match: '/rotinas' },
  { href: '/progresso', label: 'Progresso', icon: TrendingUp, match: '/progresso' },
]
const rightTabs = [
  { href: '/configuracoes', label: 'Config', icon: Settings, match: '/configuracoes' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const activeSession = usePulseStore((s) => s.activeSession)
  const treinoActive = pathname.startsWith('/treinos')

  // No workout running: the button starts one (today's suggestion lives on
  // /treinos). A workout in progress: it resumes that session directly, so
  // it switches to a darker "play" look instead of competing with primary.
  const fabHref = activeSession
    ? activeSession.templateId
      ? `/treinos/${activeSession.templateId}/sessao`
      : '/treinos/livre/sessao'
    : '/treinos'

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

      {/* Treinos — raised circular FAB, centered over the bar. Switches to a
          darker "resume" look while a workout is in progress. */}
      <Link
        href={fabHref}
        aria-label={activeSession ? 'Retomar treino' : 'Treinos'}
        className={cn(
          '-top-7 absolute left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full shadow-lg shadow-black/40 ring-4 ring-background transition-transform active:scale-95',
          activeSession
            ? 'bg-secondary text-primary'
            : 'bg-primary text-primary-foreground',
          treinoActive && 'scale-105'
        )}
      >
        {activeSession ? (
          <Play className="h-6 w-6 fill-primary" />
        ) : (
          <Dumbbell className="h-6 w-6" strokeWidth={2} />
        )}
      </Link>
    </nav>
  )
}
