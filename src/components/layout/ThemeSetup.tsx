'use client'

import { useEffect } from 'react'
import { useEchoStore } from '@/store/echo-store'

// The <head> inline script in the root layout already sets the correct
// `.dark` class before first paint (avoiding a flash). This component keeps
// it in sync afterward: reacting when the user changes the setting in-app,
// and — for 'system' — listening for OS-level light/dark changes live.
export default function ThemeSetup() {
  const themeMode = useEchoStore((s) => s.settings.themeMode)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const isDark = themeMode === 'dark' || (themeMode === 'system' && mq.matches)
      document.documentElement.classList.toggle('dark', isDark)
      const meta = document.querySelector('meta[name="theme-color"]')
      meta?.setAttribute('content', isDark ? '#0f0f0f' : '#ffffff')
    }

    apply()
    if (themeMode !== 'system') return
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [themeMode])

  return null
}
