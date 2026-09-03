'use client'

import { ChevronUp, ChevronDown, Trash2, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ExerciseTemplate, ProgressionType } from '@/types'

const REST_PRESETS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2min', value: 120 },
  { label: '3min', value: 180 },
]

const PROGRESSION_OPTIONS: { value: ProgressionType; label: string; description: string }[] = [
  {
    value: 'none',
    label: 'Nenhuma',
    description: 'Sem sugestão automática — você ajusta o peso manualmente a cada treino.',
  },
  {
    value: 'linear',
    label: 'Linear',
    description: 'Bateu todas as reps? Some o incremento no próximo treino. Senão, repita o peso.',
  },
  {
    value: 'greyskull',
    label: 'Greyskull LP',
    description:
      'A última série é livre (AMRAP). Bate o alvo → sobe o peso. Dobra o alvo → bônus em dobro. Falha 2 treinos seguidos → deload de 10%.',
  },
  {
    value: 'double',
    label: 'Dupla progressão',
    description:
      'O peso fica fixo enquanto as reps sobem dentro da faixa. Ao bater o topo da faixa em todas as séries, o peso sobe e as reps voltam ao início.',
  },
]

const DEFAULT_PROGRESSION_STEP = 2.5
const DEFAULT_WARMUP_PERCENT = 60
const DEFAULT_REPS_FROM = 8
const DEFAULT_REPS_TO = 10

interface Props {
  exercise: Omit<ExerciseTemplate, 'id'>
  index: number
  total: number
  libraryId: string
  onChange: (data: Partial<Omit<ExerciseTemplate, 'id'>>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export default function ExerciseBlockEditor({
  exercise,
  index,
  total,
  libraryId,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  const progressionType = exercise.progression?.type ?? 'none'
  const selectedProgression = PROGRESSION_OPTIONS.find((p) => p.value === progressionType)

  const setProgressionType = (type: ProgressionType) => {
    if (type === 'none') {
      onChange({ progression: undefined })
      return
    }
    onChange({
      progression: {
        type,
        step: exercise.progression?.step ?? DEFAULT_PROGRESSION_STEP,
        repsFrom: type === 'double' ? exercise.progression?.repsFrom ?? DEFAULT_REPS_FROM : undefined,
        repsTo: type === 'double' ? exercise.progression?.repsTo ?? DEFAULT_REPS_TO : undefined,
      },
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
          {index + 1}
        </span>
        <div className="flex-1">
          <Input
            placeholder="Nome do exercício"
            value={exercise.name}
            list={libraryId}
            onChange={(e) => onChange({ name: e.target.value })}
            className="border-0 bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-muted-foreground disabled:opacity-30 hover:text-foreground"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 text-muted-foreground disabled:opacity-30 hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Reps / Tempo toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ trackBy: 'reps' })}
          className={cn(
            'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
            exercise.trackBy !== 'time'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          Reps
        </button>
        <button
          type="button"
          onClick={() => onChange({ trackBy: 'time', durationMinutes: exercise.durationMinutes ?? 20 })}
          className={cn(
            'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
            exercise.trackBy === 'time'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          Tempo
        </button>
      </div>

      {exercise.trackBy === 'time' ? (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tempo (minutos)</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            value={exercise.durationMinutes ?? 20}
            onChange={(e) => onChange({ durationMinutes: parseInt(e.target.value) || 1 })}
            className="h-9 text-center"
          />
          <p className="text-[11px] text-muted-foreground">
            Registrado como uma duração única, sem séries.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Séries</Label>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={exercise.sets}
                onChange={(e) => onChange({ sets: parseInt(e.target.value) || 1 })}
                className="h-9 text-center"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Reps</Label>
              <Input
                placeholder="10 ou 8-12"
                value={exercise.reps}
                onChange={(e) => onChange({ reps: e.target.value })}
                className="h-9 text-center"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Descanso</Label>
            <div className="flex flex-wrap gap-1.5">
              {REST_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onChange({ restSeconds: p.value })}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    exercise.restSeconds === p.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {p.label}
                </button>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={exercise.restSeconds}
                  onChange={(e) => onChange({ restSeconds: parseInt(e.target.value) || 0 })}
                  className="h-7 w-16 text-center text-xs"
                />
                <span className="text-xs text-muted-foreground">s</span>
              </div>
            </div>
          </div>

          {/* Peso corporal */}
          <label className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
            <input
              type="checkbox"
              checked={!!exercise.bodyweight}
              onChange={(e) => onChange({ bodyweight: e.target.checked })}
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
                checked={!!exercise.warmupEnabled}
                onChange={(e) => onChange({ warmupEnabled: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-xs font-medium text-foreground">Aquecimento automático</span>
                <span className="block text-[11px] text-muted-foreground">
                  Adiciona uma 1ª série de aquecimento antes das séries de trabalho, com um
                  percentual a menos do peso já registrado.
                </span>
              </span>
            </label>
            {exercise.warmupEnabled && (
              <div className="flex items-center gap-2 pl-6">
                <Label className="text-[11px] text-muted-foreground shrink-0">
                  % da carga de trabalho
                </Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={10}
                  max={95}
                  value={exercise.warmupPercent ?? DEFAULT_WARMUP_PERCENT}
                  onChange={(e) => onChange({ warmupPercent: parseInt(e.target.value) || DEFAULT_WARMUP_PERCENT })}
                  className="h-8 w-20 text-center text-xs"
                />
                <span className="text-[11px] text-muted-foreground">%</span>
              </div>
            )}
          </div>

          {/* Progressão automática */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Progressão automática</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {PROGRESSION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProgressionType(opt.value)}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                    progressionType === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {selectedProgression && (
              <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Info className="h-3 w-3 shrink-0 mt-0.5" />
                {selectedProgression.description}
              </p>
            )}

            {progressionType !== 'none' && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <Label className="text-[11px] text-muted-foreground shrink-0">Incremento</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min={0}
                    value={exercise.progression?.step ?? DEFAULT_PROGRESSION_STEP}
                    onChange={(e) =>
                      onChange({
                        progression: {
                          type: progressionType,
                          step: parseFloat(e.target.value) || DEFAULT_PROGRESSION_STEP,
                          repsFrom: exercise.progression?.repsFrom,
                          repsTo: exercise.progression?.repsTo,
                        },
                      })
                    }
                    className="h-8 w-16 text-center text-xs"
                  />
                </div>

                {progressionType === 'double' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Label className="text-[11px] text-muted-foreground shrink-0">Reps de</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={exercise.progression?.repsFrom ?? DEFAULT_REPS_FROM}
                        onChange={(e) =>
                          onChange({
                            progression: {
                              type: 'double',
                              step: exercise.progression?.step ?? DEFAULT_PROGRESSION_STEP,
                              repsFrom: parseInt(e.target.value) || DEFAULT_REPS_FROM,
                              repsTo: exercise.progression?.repsTo ?? DEFAULT_REPS_TO,
                            },
                          })
                        }
                        className="h-8 w-14 text-center text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Label className="text-[11px] text-muted-foreground shrink-0">até</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={exercise.progression?.repsTo ?? DEFAULT_REPS_TO}
                        onChange={(e) =>
                          onChange({
                            progression: {
                              type: 'double',
                              step: exercise.progression?.step ?? DEFAULT_PROGRESSION_STEP,
                              repsFrom: exercise.progression?.repsFrom ?? DEFAULT_REPS_FROM,
                              repsTo: parseInt(e.target.value) || DEFAULT_REPS_TO,
                            },
                          })
                        }
                        className="h-8 w-14 text-center text-xs"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {exercise.notes !== undefined && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Observação</Label>
          <Input
            placeholder="Ex: foco na contração"
            value={exercise.notes ?? ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange({ notes: exercise.notes === undefined ? '' : undefined })}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        {exercise.notes === undefined ? '+ Adicionar observação' : '- Remover observação'}
      </button>
    </div>
  )
}
