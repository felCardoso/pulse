'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { usePulseStore } from '@/store/pulse-store'
import type { SessionExercise } from '@/types'

const DEFAULT_WARMUP_PERCENT = 60

interface Props {
  onAdd: (exercise: Omit<SessionExercise, 'id' | 'order'>) => void
  onClose: () => void
}

export default function AddExerciseSheet({ onAdd, onClose }: Props) {
  const getExerciseLibrary = usePulseStore((s) => s.getExerciseLibrary)
  const [name, setName] = useState('')
  const [trackBy, setTrackBy] = useState<'reps' | 'time'>('reps')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [rest, setRest] = useState('90')
  const [minutes, setMinutes] = useState('20')
  const [bodyweight, setBodyweight] = useState(false)
  const [warmupEnabled, setWarmupEnabled] = useState(false)
  const [warmupPercent, setWarmupPercent] = useState(String(DEFAULT_WARMUP_PERCENT))
  const [restPauseEnabled, setRestPauseEnabled] = useState(false)

  const library = getExerciseLibrary()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (trackBy === 'time') {
      onAdd({
        templateExerciseId: undefined,
        name: name.trim(),
        plannedSets: 0,
        plannedReps: '',
        restSeconds: 0,
        completed: false,
        sets: [],
        trackBy: 'time',
        plannedDurationMinutes: parseFloat(minutes) || 20,
      })
    } else {
      const plannedSets = parseInt(sets) || 3
      onAdd({
        templateExerciseId: undefined,
        name: name.trim(),
        plannedSets,
        plannedReps: reps || '10',
        restSeconds: parseInt(rest) || 90,
        completed: false,
        trackBy: 'reps',
        bodyweight,
        warmupEnabled,
        warmupPercent: parseInt(warmupPercent) || DEFAULT_WARMUP_PERCENT,
        restPauseEnabled,
        sets: Array.from({ length: plannedSets }, (_, i) => ({
          id: uuid(),
          setNumber: i + 1,
          done: false,
        })),
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-border bg-background px-6 pb-safe pt-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Adicionar exercício</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <datalist id="add-ex-library">
          {library.map((ex) => <option key={ex} value={ex} />)}
        </datalist>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={name}
              list="add-ex-library"
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do exercício"
              autoFocus
            />
          </div>

          {/* Reps / Tempo toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTrackBy('reps')}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                trackBy === 'reps'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              Reps
            </button>
            <button
              type="button"
              onClick={() => setTrackBy('time')}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                trackBy === 'time'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              Tempo
            </button>
          </div>

          {trackBy === 'time' ? (
            <div className="space-y-1.5">
              <Label>Tempo (minutos)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="text-center"
              />
              <p className="text-xs text-muted-foreground">Registrado como uma duração única.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Séries</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Reps</Label>
                  <Input
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Descanso(s)</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={rest}
                    onChange={(e) => setRest(e.target.value)}
                    className="text-center"
                  />
                </div>
              </div>

              {/* Peso corporal */}
              <label className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={bodyweight}
                  onChange={(e) => setBodyweight(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="block text-xs font-medium text-foreground">Peso corporal</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Não pede carga ao registrar as séries — usa o peso do seu corpo.
                  </span>
                </span>
              </label>

              {/* Aquecimento automático */}
              <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5 space-y-2">
                <label className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={warmupEnabled}
                    onChange={(e) => setWarmupEnabled(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="block text-xs font-medium text-foreground">Aquecimento automático</span>
                    <span className="block text-[11px] text-muted-foreground">
                      Adiciona uma 1ª série de aquecimento, com um percentual a menos do peso já
                      registrado para este exercício.
                    </span>
                  </span>
                </label>
                {warmupEnabled && (
                  <div className="flex items-center gap-2 pl-6">
                    <Label className="text-[11px] text-muted-foreground shrink-0">
                      % da carga de trabalho
                    </Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={10}
                      max={95}
                      value={warmupPercent}
                      onChange={(e) => setWarmupPercent(e.target.value)}
                      className="h-8 w-20 text-center text-xs"
                    />
                    <span className="text-[11px] text-muted-foreground">%</span>
                  </div>
                )}
              </div>

              {/* Rest-Pause */}
              <label className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={restPauseEnabled}
                  onChange={(e) => setRestPauseEnabled(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="block text-xs font-medium text-foreground">Rest-Pause</span>
                  <span className="block text-[11px] text-muted-foreground">
                    Troca o descanso configurado por um intervalo curto e silencioso de 15s,
                    avisado por vibração dupla em vez de som.
                  </span>
                </span>
              </label>
            </>
          )}

          <Button type="submit" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </form>
      </div>
    </div>
  )
}
