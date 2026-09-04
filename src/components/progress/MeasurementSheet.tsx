'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEchoStore } from '@/store/echo-store'
import { getLocalDateStr } from '@/utils/format'

interface Props {
  onClose: () => void
}

interface BioField {
  key: 'bodyFatPct' | 'musclePct' | 'waterPct' | 'visceralFat'
  label: string
  placeholder: string
}

const BIO_FIELDS: BioField[] = [
  { key: 'bodyFatPct', label: 'Gordura (%)', placeholder: '22.5' },
  { key: 'musclePct', label: 'Músculo (%)', placeholder: '38.0' },
  { key: 'waterPct', label: 'Água (%)', placeholder: '55.0' },
  { key: 'visceralFat', label: 'Gordura visceral', placeholder: '7' },
]

export default function MeasurementSheet({ onClose }: Props) {
  const addBodyMeasurement = useEchoStore((s) => s.addBodyMeasurement)
  const bioimpedance = useEchoStore((s) => !!s.settings.bioimpedance)
  const weightUnit = useEchoStore((s) => s.settings.weightUnit)
  const lastMeasurement = useEchoStore((s) => s.bodyMeasurements[s.bodyMeasurements.length - 1])

  const [weight, setWeight] = useState('')
  const [bio, setBio] = useState<Record<BioField['key'], string>>({
    bodyFatPct: '',
    musclePct: '',
    waterPct: '',
    visceralFat: '',
  })

  const weightNum = parseFloat(weight)
  const valid = weight !== '' && !isNaN(weightNum) && weightNum > 0

  const handleSave = () => {
    if (!valid) return

    const parseOptional = (v: string) => {
      const n = parseFloat(v)
      return v !== '' && !isNaN(n) && n >= 0 ? n : undefined
    }

    addBodyMeasurement({
      date: getLocalDateStr(),
      weightKg: Math.round(weightNum * 10) / 10,
      ...(bioimpedance && {
        bodyFatPct: parseOptional(bio.bodyFatPct),
        musclePct: parseOptional(bio.musclePct),
        waterPct: parseOptional(bio.waterPct),
        visceralFat: parseOptional(bio.visceralFat),
      }),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 animate-fade-in">
      <div className="w-full bg-background rounded-t-2xl border-t border-border p-4 space-y-4 max-h-[85vh] overflow-y-auto animate-slide-up-sheet">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Registrar medição</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Peso ({weightUnit})</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={lastMeasurement ? String(lastMeasurement.weightKg) : '75.0'}
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-center text-lg font-semibold tabular-nums placeholder:text-muted-foreground placeholder:font-normal focus:border-primary focus:outline-none"
          />
        </div>

        {bioimpedance && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Bioimpedância (opcional — preencha o que sua balança informar)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BIO_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={bio[field.key]}
                    onChange={(e) => setBio({ ...bio, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-center tabular-nums placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!valid} className="flex-1 gap-2">
            <Check className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}
