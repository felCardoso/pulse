'use client'

import { useRef, useState } from 'react'
import { Camera, Trash2, X } from 'lucide-react'
import { usePulseStore } from '@/store/pulse-store'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { compressImage, estimateBytes, formatBytes } from '@/lib/image'
import type { ProgressPhoto } from '@/types'

// localStorage quota is ~5MB for the whole store — keep photos well below.
const SOFT_LIMIT_BYTES = 3.5 * 1024 * 1024
const HARD_LIMIT_BYTES = 4.2 * 1024 * 1024

function formatDateBR(date: string): string {
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

export default function ProgressPhotos() {
  const progressPhotos = usePulseStore((s) => s.progressPhotos)
  const addProgressPhoto = usePulseStore((s) => s.addProgressPhoto)
  const deleteProgressPhoto = usePulseStore((s) => s.deleteProgressPhoto)

  const inputRef = useRef<HTMLInputElement>(null)
  const [viewing, setViewing] = useState<ProgressPhoto | null>(null)
  const [deleting, setDeleting] = useState<ProgressPhoto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const totalBytes = estimateBytes(progressPhotos.map((p) => p.dataUrl))
  const nearLimit = totalBytes > SOFT_LIMIT_BYTES

  // Newest first.
  const photos = [...progressPhotos].sort((a, b) => b.date.localeCompare(a.date))

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const dataUrl = await compressImage(file)
      if (totalBytes + dataUrl.length > HARD_LIMIT_BYTES) {
        setError(
          `Limite de armazenamento atingido (${formatBytes(totalBytes)}). Exclua fotos antigas para adicionar novas.`
        )
        return
      }
      addProgressPhoto(dataUrl)
    } catch {
      setError('Não foi possível processar a imagem.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fotos de progresso
        </h2>
        {photos.length > 0 && (
          <span className={`text-[10px] tabular-nums ${nearLimit ? 'text-orange-500 font-semibold' : 'text-muted-foreground'}`}>
            {formatBytes(totalBytes)} usados
          </span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-24 w-20 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
        >
          <Camera className="h-5 w-5" />
          <span className="text-[10px] font-medium">{busy ? '...' : 'Adicionar'}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />

        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setViewing(photo)}
            className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.dataUrl}
              alt={`Foto de ${formatDateBR(photo.date)}`}
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[9px] font-medium text-white tabular-nums">
              {formatDateBR(photo.date)}
            </span>
          </button>
        ))}
      </div>

      {nearLimit && !error && (
        <p className="text-xs text-orange-500">
          Armazenamento de fotos quase cheio — considere excluir as mais antigas.
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Full-screen viewer */}
      {viewing && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/95"
          onClick={() => setViewing(null)}
        >
          <div className="flex items-center justify-between p-4">
            <p className="text-sm font-medium text-white tabular-nums">
              {formatDateBR(viewing.date)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleting(viewing)
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewing(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center p-4 pb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewing.dataUrl}
              alt={`Foto de ${formatDateBR(viewing.date)}`}
              className="max-h-full max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir foto"
        description={
          deleting ? `Remover a foto de ${formatDateBR(deleting.date)}?` : undefined
        }
        onConfirm={() => {
          if (deleting) {
            deleteProgressPhoto(deleting.id)
            setViewing(null)
          }
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
