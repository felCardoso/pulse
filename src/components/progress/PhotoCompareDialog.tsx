'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, MoveHorizontal } from 'lucide-react'
import { Label } from '@/components/ui/label'
import type { ProgressPhoto } from '@/types'

interface Props {
  photos: ProgressPhoto[]
  onClose: () => void
}

function formatDateBR(date: string): string {
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

/** Before/after drag-to-reveal comparison between two chosen progress photos.
 * Photos come in newest-first (see ProgressPhotos); defaults to the oldest
 * as "antes" and the newest as "depois". */
export default function PhotoCompareDialog({ photos, onClose }: Props) {
  const oldest = photos[photos.length - 1]
  const newest = photos[0]

  const [beforeId, setBeforeId] = useState(oldest.id)
  const [afterId, setAfterId] = useState(newest.id)
  const [sliderPos, setSliderPos] = useState(50)

  const before = photos.find((p) => p.id === beforeId) ?? oldest
  const after = photos.find((p) => p.id === afterId) ?? newest

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-background animate-fade-in">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-base font-semibold text-foreground">Comparar fotos</h2>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Antes</Label>
          <select
            value={beforeId}
            onChange={(e) => setBeforeId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
          >
            {photos.map((p) => (
              <option key={p.id} value={p.id}>
                {formatDateBR(p.date)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Depois</Label>
          <select
            value={afterId}
            onChange={(e) => setAfterId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"
          >
            {photos.map((p) => (
              <option key={p.id} value={p.id}>
                {formatDateBR(p.date)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 items-center px-4 pb-6">
        <div className="relative aspect-[3/4] w-full max-h-full overflow-hidden rounded-2xl border border-border mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={after.dataUrl} alt="Depois" className="absolute inset-0 h-full w-full object-cover" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={before.dataUrl}
            alt="Antes"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          />

          <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            Antes · {formatDateBR(before.date)}
          </span>
          <span className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            Depois · {formatDateBR(after.date)}
          </span>

          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
            style={{ left: `${sliderPos}%` }}
          />
          <div
            className="pointer-events-none absolute flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg"
            style={{ left: `${sliderPos}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <MoveHorizontal className="h-4 w-4" />
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            aria-label="Arraste para comparar"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
