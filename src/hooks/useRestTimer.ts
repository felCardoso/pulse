'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface RestTimerReturn {
  isActive: boolean
  timeLeft: number
  totalSeconds: number
  start: (seconds: number) => void
  skip: () => void
}

export function useRestTimer(onEnd?: () => void): RestTimerReturn {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const endTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  const tick = useCallback(() => {
    if (!endTimeRef.current) return
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
    setTimeLeft(remaining)
    if (remaining > 0) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      setIsActive(false)
      endTimeRef.current = null
      onEndRef.current?.()
    }
  }, [])

  const start = useCallback(
    (seconds: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setTotalSeconds(seconds)
      setTimeLeft(seconds)
      endTimeRef.current = Date.now() + seconds * 1000
      setIsActive(true)
      rafRef.current = requestAnimationFrame(tick)
    },
    [tick]
  )

  const skip = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setIsActive(false)
    setTimeLeft(0)
    endTimeRef.current = null
  }, [])

  // Resume ticking when tab becomes visible again
  useEffect(() => {
    const onVisible = () => {
      if (endTimeRef.current && isActive) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [isActive, tick])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { isActive, timeLeft, totalSeconds, start, skip }
}
