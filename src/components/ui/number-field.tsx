'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

interface Props {
  value: number
  onChange: (value: number) => void
  fallback: number
  className?: string
  min?: number
  max?: number
  step?: string | number
}

/**
 * A controlled numeric input that can actually be cleared. A plain
 * `value={n}` + `onChange={parseInt(...) || fallback}` input snaps back to
 * the fallback on every keystroke once the field is empty, making it
 * impossible to backspace and type a new number. This keeps its own text
 * buffer, only pushing a value up while it parses to a real number, and
 * only resets to the fallback on blur if left empty/invalid.
 */
export function NumberField({ value, onChange, fallback, className, min, max, step }: Props) {
  const [text, setText] = useState(String(value))

  // Only re-sync from the parent when it changed for a reason other than
  // our own onChange (e.g. a preset button) — never while the typed text
  // already represents the current value, or a mid-edit "2." would be
  // clobbered back to "2".
  useEffect(() => {
    const parsed = parseFloat(text)
    if (parsed !== value) setText(String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <Input
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        const parsed = parseFloat(e.target.value)
        if (!isNaN(parsed)) onChange(parsed)
      }}
      onBlur={() => {
        if (isNaN(parseFloat(text))) {
          setText(String(fallback))
          onChange(fallback)
        }
      }}
      className={className}
    />
  )
}
