'use client'

import { usePathname } from 'next/navigation'

// Remounting the subtree on every route change (keyed by pathname) restarts
// the CSS animation, giving each screen a simple fade+slide-in entrance.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="animate-fade-in-up">
      {children}
    </div>
  )
}
