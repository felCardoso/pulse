'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  onSelect: () => void
  destructive?: boolean
}

interface Props {
  items: ContextMenuItem[]
  children: React.ReactNode
  className?: string
}

export default function ContextMenu({ items, children, className }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openAt = (x: number, y: number) => {
    // Clamp so the menu stays inside the viewport.
    const menuW = 180
    const menuH = items.length * 44 + 8
    const clampedX = Math.min(Math.max(8, x), window.innerWidth - menuW - 8)
    const clampedY = Math.min(Math.max(8, y), window.innerHeight - menuH - 8)
    setPos({ x: clampedX, y: clampedY })
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    openAt(e.clientX, e.clientY)
  }

  // Long-press as a touch-friendly fallback for right-click.
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    longPress.current = setTimeout(() => openAt(t.clientX, t.clientY), 500)
  }
  const cancelLongPress = () => {
    if (longPress.current) {
      clearTimeout(longPress.current)
      longPress.current = null
    }
  }

  useEffect(() => {
    if (!pos) return
    const close = () => setPos(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPos(null)
    }
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [pos])

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        className={className}
      >
        {children}
      </div>
      {pos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[60] min-w-[160px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
            style={{ left: pos.x, top: pos.y }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setPos(null)
                  item.onSelect()
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                  item.destructive ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  )
}
