'use client'

import { useRef } from 'react'

const DEFAULT_MS = 500

/**
 * Distinguishes a tap from a press-and-hold on the same element. A short
 * release before `ms` fires `onClick`; holding past `ms` fires `onLongPress`
 * once and suppresses the subsequent click.
 */
export function useLongPress(onLongPress: () => void, onClick?: () => void, ms = DEFAULT_MS) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedLongPress = useRef(false)

  const start = () => {
    firedLongPress.current = false
    timer.current = setTimeout(() => {
      firedLongPress.current = true
      onLongPress()
    }, ms)
  }

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const end = () => {
    clear()
    if (!firedLongPress.current) onClick?.()
  }

  return {
    onPointerDown: start,
    onPointerUp: end,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu: (e: React.SyntheticEvent) => e.preventDefault(),
  }
}
