'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Clock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/treinos', label: 'Treinos', icon: Dumbbell, match: '/treinos' },
  { href: '/historico', label: 'Histórico', icon: Clock, match: '/historico' },
  { href: '/configuracoes', label: 'Config', icon: Settings, match: '/configuracoes' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-safe pt-2">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = pathname.startsWith(match)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-5 py-2 text-xs font-medium transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn('h-5 w-5 transition-colors', active && 'text-primary')}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
