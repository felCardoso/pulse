'use client'

import { useRef, useState } from 'react'
import { Download, Upload, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { usePulseStore } from '@/store/pulse-store'
import { exportBackup, parseBackup } from '@/lib/backup'
import SavedFoodsManager from '@/components/macros/SavedFoodsManager'

const REST_OPTIONS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2min', value: 120 },
  { label: '3min', value: 180 },
]

export default function ConfiguracoesPage() {
  const settings = usePulseStore((s) => s.settings)
  const updateSettings = usePulseStore((s) => s.updateSettings)
  const templates = usePulseStore((s) => s.templates)
  const sessions = usePulseStore((s) => s.sessions)
  const personalRecords = usePulseStore((s) => s.personalRecords)
  const importRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const handleHueChange = (value: number) => {
    document.documentElement.style.setProperty('--primary-hue', String(value))
    updateSettings({ primaryHue: value })
  }

  const handleExport = () => {
    exportBackup({ templates, sessions, personalRecords, settings })
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
    if (!confirm('Tem certeza? Todos os seus dados serão apagados permanentemente.')) return
    usePulseStore.setState({
      templates: [],
      sessions: [],
      activeSession: null,
      personalRecords: {},
    })
  }

  return (
    <div className="space-y-8 pb-8">
      <h1 className="text-2xl font-bold text-foreground pt-2">Configurações</h1>

      {/* Appearance */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Aparência
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="space-y-3">
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
        </div>
      </section>

      {/* Workout settings */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Treino
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="space-y-2">
            <Label>Unidade de peso</Label>
            <div className="flex gap-2">
              {(['kg', 'lbs'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => updateSettings({ weightUnit: unit })}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    settings.weightUnit === unit
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
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
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    settings.defaultRestSeconds === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Feedback
        </h2>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3.5">
            <Label className="cursor-pointer">Vibração</Label>
            <button
              role="switch"
              aria-checked={settings.hapticEnabled}
              onClick={() => updateSettings({ hapticEnabled: !settings.hapticEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.hapticEnabled ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.hapticEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <Label className="cursor-pointer">Som</Label>
            <button
              role="switch"
              aria-checked={settings.soundEnabled}
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Alimentos salvos */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Alimentos Salvos
        </h2>
        <SavedFoodsManager />
      </section>

      {/* Data */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Dados
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
            onClick={handleClearData}
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
  )
}
