'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Download, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'

interface Props {
  onCancel: () => void
  onConfirm: () => void
  /** Exports a backup file; the dialog stays open */
  onBackup: () => void
}

// Destructive-action dialog: the user must type a random 6-digit code to
// enable the delete button, and can export a backup first if data exists.
export default function ClearDataDialog({ onCancel, onConfirm, onBackup }: Props) {
  // New code every time the dialog opens (component mounts conditionally).
  const [code] = useState(() => String(Math.floor(100000 + Math.random() * 900000)))
  const [typed, setTyped] = useState('')
  const [backedUp, setBackedUp] = useState(false)

  const templates = usePulseStore((s) => s.templates.length)
  const sessions = usePulseStore((s) => s.sessions.length)
  const foods = usePulseStore((s) => s.foods.length)
  const meals = usePulseStore((s) => s.dailyMacroLogs.length)
  const measurements = usePulseStore((s) => s.bodyMeasurements.length)
  const photos = usePulseStore((s) => s.progressPhotos.length)

  const dataSummary = [
    templates > 0 && `${templates} treino${templates !== 1 ? 's' : ''}`,
    sessions > 0 && `${sessions} sess${sessions !== 1 ? 'ões' : 'ão'}`,
    foods > 0 && `${foods} alimento${foods !== 1 ? 's' : ''}`,
    meals > 0 && `${meals} refei${meals !== 1 ? 'ções' : 'ção'}`,
    measurements > 0 && `${measurements} medi${measurements !== 1 ? 'ções' : 'ção'}`,
    photos > 0 && `${photos} foto${photos !== 1 ? 's' : ''}`,
  ].filter(Boolean) as string[]

  const hasData = dataSummary.length > 0
  const matches = typed === code

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onCancel])

  const handleBackup = () => {
    onBackup()
    setBackedUp(true)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground">Apagar todos os dados</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Isso remove permanentemente tudo que está salvo neste aparelho. Não dá para desfazer.
            </p>
          </div>
        </div>

        {/* Backup offer when there is data to lose */}
        {hasData && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/8 p-3 space-y-2">
            <p className="text-xs text-orange-500">
              Você tem dados salvos: <span className="font-semibold">{dataSummary.join(', ')}</span>.
            </p>
            {backedUp ? (
              <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Check className="h-3.5 w-3.5" />
                Backup exportado — guarde o arquivo em local seguro
              </p>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackup}
                className="w-full gap-1.5 h-8 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Fazer backup antes de apagar
              </Button>
            )}
          </div>
        )}

        {/* Confirmation code */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Para confirmar, digite o código abaixo:
          </p>
          <p className="select-none text-center font-mono text-2xl font-bold tracking-[0.3em] text-foreground tabular-nums">
            {code}
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="______"
            className={`w-full rounded-lg border bg-secondary px-3 py-2 text-center font-mono text-lg tracking-[0.3em] text-foreground tabular-nums placeholder:text-muted-foreground focus:outline-none ${
              typed.length === 6 && !matches
                ? 'border-destructive'
                : matches
                ? 'border-primary'
                : 'border-border focus:border-primary'
            }`}
          />
          {typed.length === 6 && !matches && (
            <p className="text-center text-xs text-destructive">Código incorreto</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!matches}
            onClick={onConfirm}
            className="flex-1 gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            Apagar tudo
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
