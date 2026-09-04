'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

// The Android status bar defaults to a plain white background with dark
// icons — that clashes with Echo's fixed dark theme. Matches it to the
// app's --background token and switches to light (white) icons so time,
// battery, etc. stay legible against the dark bar.
export default function StatusBarSetup() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    StatusBar.setBackgroundColor({ color: '#0f0f0f' }).catch(() => {})
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
  }, [])

  return null
}
