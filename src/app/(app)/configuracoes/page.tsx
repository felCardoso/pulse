'use client'

import { useRef, useState } from 'react'
import { Download, Upload, Trash2, Palette, Dumbbell, Apple, TrendingUp, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { usePulseStore } from '@/store/pulse-store'
import { exportBackup, parseBackup } from '@/lib/backup'
import SavedFoodsManager from '@/components/macros/SavedFoodsManager'
import ClearDataDialog from '@/components/settings/ClearDataDialog'

const REST_OPTIONS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2min', value: 120 },
  { label: '3min', value: 180 },
]

type Tab = 'geral' | 'treino' | 'nutricao' | 'progresso' | 'dados'

const TABS: { key: Tab; label: string; icon: typeof Palette }[] = [
  { key: 'geral', label: 'Geral', icon: Palette },
  { key: 'treino', label: 'Treino', icon: Dumbbell },
  { key: 'nutricao', label: 'Nutrição', icon: Apple },
  { key: 'progresso', label: 'Progresso', icon: TrendingUp },
  { key: 'dados', label: 'Dados', icon: Database },
]

export default function ConfiguracoesPage() {
  const settings = usePulseStore((s) => s.settings)
  const updateSettings = usePulseStore((s) => s.updateSettings)
  const templates = usePulseStore((s) => s.templates)
  const sessions = usePulseStore((s) => s.sessions)
  const personalRecords = usePulseStore((s) => s.personalRecords)
  const foods = usePulseStore((s) => s.foods)
  const dailyMacroLogs = usePulseStore((s) => s.dailyMacroLogs)
  const macroTargets = usePulseStore((s) => s.macroTargets)
  const bodyMeasurements = usePulseStore((s) => s.bodyMeasurements)
  const weightGoalKg = usePulseStore((s) => s.weightGoalKg)
  const progressPhotos = usePulseStore((s) => s.progressPhotos)
  const weeklySchedule = usePulseStore((s) => s.weeklySchedule)
  const habits = usePulseStore((s) => s.habits)
  const importRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [tab, setTab] = useState<Tab>('geral')
  const [showClearDialog, setShowClearDialog] = useState(false)

  const handleHueChange = (value: number) => {
    document.documentElement.style.setProperty('--primary-hue', String(value))
    updateSettings({ primaryHue: value })
  }

  const handleExport = () => {
    exportBackup({
      templates,
      sessions,
      personalRecords,
      settings,
      foods,
      dailyMacroLogs,
      macroTargets,
      bodyMeasurements,
      weightGoalKg,
      progressPhotos,
      weeklySchedule,
      habits,
    })
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    setImportSuccess(false)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = parseBackup(ev.target?.result as string)
        usePulseStore.setState({
          templates: data.templates,
          sessions: data.sessions,
          personalRecords: data.personalRecords,
          settings: { ...settings, ...data.settings },
          foods: data.foods ?? [],
          dailyMacroLogs: data.dailyMacroLogs ?? [],
          ...(data.macroTargets && { macroTargets: data.macroTargets }),
          bodyMeasurements: data.bodyMeasurements ?? [],
          weightGoalKg: data.weightGoalKg ?? null,
          progressPhotos: data.progressPhotos ?? [],
          weeklySchedule: data.weeklySchedule ?? {},
          habits: data.habits ?? [],
        })
        setImportSuccess(true)
      } catch {
        setImportError('Arquivo inválido. Verifique se é um backup do Pulse.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearData = () => {
    usePulseStore.setState({
      templates: [],
      sessions: [],
      activeSession: null,
      personalRecords: {},
      foods: [],
      dailyMacroLogs: [],
      bodyMeasurements: [],
      weightGoalKg: null,
      progressPhotos: [],
      weeklySchedule: {},
      habits: [],
    })
    setShowClearDialog(false)
  }

  const switchButton = (checked: boolean, onToggle: () => void, label: string) => (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-secondary'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold text-foreground pt-2">Configurações</h1>

      {/* Theme tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
              tab === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Geral ─── */}
      {tab === 'geral' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Aparência
            </h2>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Cor primária</Label>
                <div
                  className="h-5 w-5 rounded-full border border-border"
                  style={{ background: `hsl(${settings.primaryHue}, 83%, 68%)` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={359}
                value={settings.primaryHue}
                onChange={(e) => handleHueChange(Number(e.target.value))}
                className="w-full accent-primary"
                style={{
                  background: `linear-gradient(to right, hsl(0,83%,68%), hsl(60,83%,68%), hsl(120,83%,68%), hsl(180,83%,68%), hsl(240,83%,68%), hsl(300,83%,68%), hsl(360,83%,68%))`,
                }}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Feedback
            </h2>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              <div className="flex items-center justify-between px-4 py-3.5">
                <Label className="cursor-pointer">Vibração</Label>
                {switchButton(
                  settings.hapticEnabled,
                  () => updateSettings({ hapticEnabled: !settings.hapticEnabled }),
                  'Vibração'
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <Label className="cursor-pointer">Som</Label>
                {switchButton(
                  settings.soundEnabled,
                  () => updateSettings({ soundEnabled: !settings.soundEnabled }),
                  'Som'
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─── Treino ─── */}
      {tab === 'treino' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Preferências de treino
            </h2>
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div className="space-y-2">
                <Label>Unidade de peso</Label>
                <div className="flex gap-2">
                  {(['kg', 'lbs'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => updateSettings({ weightUnit: unit })}
                      className={cn(
                        'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                        settings.weightUnit === unit
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descanso padrão</Label>
                <div className="flex flex-wrap gap-2">
                  {REST_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ defaultRestSeconds: opt.value })}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        settings.defaultRestSeconds === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <p className="text-xs text-muted-foreground">
            A agenda semanal de treinos agora fica na aba Treinos.
          </p>
        </div>
      )}

      {/* ─── Nutrição ─── */}
      {tab === 'nutricao' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Alimentos Salvos
            </h2>
            <SavedFoodsManager />
          </section>
          <p className="text-xs text-muted-foreground">
            As metas de calorias e macros são definidas na aba Macros (botão de perfil).
          </p>
        </div>
      )}

      {/* ─── Progresso ─── */}
      {tab === 'progresso' && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Progresso Corporal
          </h2>
          <div className="rounded-xl border border-border bg-card px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div className="pr-3">
                <Label className="cursor-pointer">Bioimpedância</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sua balança mede gordura, músculo e água? Ative para registrar
                  e acompanhar esses dados na aba Progresso.
                </p>
              </div>
              {switchButton(
                !!settings.bioimpedance,
                () => updateSettings({ bioimpedance: !settings.bioimpedance }),
                'Bioimpedância'
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── Dados ─── */}
      {tab === 'dados' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Backup
            </h2>
            <div className="space-y-2.5">
              <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Exportar backup
              </Button>
              <input
                ref={importRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => importRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Importar backup
              </Button>
              {importError && <p className="text-xs text-destructive text-center">{importError}</p>}
              {importSuccess && (
                <p className="text-xs text-primary text-center">Backup importado com sucesso!</p>
              )}
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive border-destructive/30"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Limpar todos os dados
              </Button>
            </div>
          </section>

          <p className="text-center text-xs text-muted-foreground">
            Pulse · {templates.length} treinos · {sessions.length} sessões
          </p>
        </div>
      )}

      {showClearDialog && (
        <ClearDataDialog
          onCancel={() => setShowClearDialog(false)}
          onConfirm={handleClearData}
          onBackup={handleExport}
        />
      )}
    </div>
  )
}
