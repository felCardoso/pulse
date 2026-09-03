'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Disc, Dumbbell, Flame, TrendingUp, WifiOff, ChevronLeft, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePulseStore } from '@/store/pulse-store'

type Goal = 'cutting' | 'maintain' | 'bulking'

const GOALS: { key: Goal; label: string; description: string }[] = [
  { key: 'cutting', label: 'Perder gordura', description: 'Déficit calórico (cutting)' },
  { key: 'maintain', label: 'Manter', description: 'Manutenção do peso atual' },
  { key: 'bulking', label: 'Ganhar massa', description: 'Superávit calórico (bulking)' },
]

// Rough starting targets from body weight: 2g/kg protein, 0.9g/kg fat,
// ~33 kcal/kg maintenance adjusted by goal; carbs fill the rest.
function suggestMacros(weightKg: number, goal: Goal) {
  const factor = goal === 'cutting' ? 0.85 : goal === 'bulking' ? 1.1 : 1
  const kcal = Math.round((weightKg * 33 * factor) / 10) * 10
  const protein = Math.round(weightKg * 2)
  const fat = Math.round(weightKg * 0.9)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { kcal, protein, carbs, fat }
}

export default function OnboardingFlow() {
  const router = useRouter()

  const onboardingCompleted = usePulseStore((s) => s.onboardingCompleted)
  const completeOnboarding = usePulseStore((s) => s.completeOnboarding)
  const updateMacroTargets = usePulseStore((s) => s.updateMacroTargets)
  const addBodyMeasurement = usePulseStore((s) => s.addBodyMeasurement)
  const setWeightGoal = usePulseStore((s) => s.setWeightGoal)
  const macroTargets = usePulseStore((s) => s.macroTargets)

  // Anything already in the store means this isn't a first launch.
  const hasData = usePulseStore(
    (s) =>
      s.templates.length > 0 ||
      s.sessions.length > 0 ||
      s.dailyMacroLogs.length > 0 ||
      s.bodyMeasurements.length > 0
  )

  // Wait for localStorage hydration so existing users never see a flash.
  // persist API is unavailable during SSR/prerender — only touch it in
  // an effect (this is what broke the Vercel build when accessed in render).
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    if (usePulseStore.persist?.hasHydrated()) {
      setHydrated(true)
      return
    }
    return usePulseStore.persist?.onFinishHydration(() => setHydrated(true))
  }, [])

  // Existing users (data present but flag missing) skip silently.
  useEffect(() => {
    if (hydrated && !onboardingCompleted && hasData) completeOnboarding()
  }, [hydrated, onboardingCompleted, hasData, completeOnboarding])

  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState<Goal>('maintain')
  const [weight, setWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [kcal, setKcal] = useState(String(macroTargets.kcal))
  const [protein, setProtein] = useState(String(macroTargets.protein))
  const [carbs, setCarbs] = useState(String(macroTargets.carbs))
  const [fat, setFat] = useState(String(macroTargets.fat))

  if (!hydrated || onboardingCompleted || hasData) return null

  const weightNum = parseFloat(weight)
  const hasWeight = weight !== '' && !isNaN(weightNum) && weightNum > 0

  const goToMacros = () => {
    // Pre-fill macro targets from weight + goal when available.
    if (hasWeight) {
      const s = suggestMacros(weightNum, goal)
      setKcal(String(s.kcal))
      setProtein(String(s.protein))
      setCarbs(String(s.carbs))
      setFat(String(s.fat))
    }
    setStep(2)
  }

  const finish = (createWorkout: boolean) => {
    if (hasWeight) {
      addBodyMeasurement({
        date: new Date().toISOString().split('T')[0],
        weightKg: Math.round(weightNum * 10) / 10,
      })
    }
    const goalNum = parseFloat(targetWeight)
    if (targetWeight !== '' && !isNaN(goalNum) && goalNum > 0) {
      setWeightGoal(Math.round(goalNum * 10) / 10)
    }
    const parse = (v: string, fallback: number) => {
      const n = parseFloat(v)
      return !isNaN(n) && n > 0 ? n : fallback
    }
    updateMacroTargets({
      kcal: Math.round(parse(kcal, macroTargets.kcal)),
      protein: parse(protein, macroTargets.protein),
      carbs: parse(carbs, macroTargets.carbs),
      fat: parse(fat, macroTargets.fat),
    })
    completeOnboarding()
    if (createWorkout) router.push('/treinos/novo')
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-center tabular-nums placeholder:text-muted-foreground focus:border-primary focus:outline-none'

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-background">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-8">
        {/* Header: back + progress dots */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="h-8 w-8" />
          )}
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'
                )}
              />
            ))}
          </div>
          <button
            onClick={() => finish(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Pular
          </button>
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="flex flex-1 flex-col justify-center gap-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15">
                <Disc className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Bem-vindo ao Loop</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Treino, macros e progresso corporal em um só lugar
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: Dumbbell, text: 'Registre treinos com 1 toque por série' },
                { icon: Flame, text: 'Acompanhe calorias e macros do dia' },
                { icon: TrendingUp, text: 'Veja sua evolução: peso, cargas e recordes' },
                { icon: WifiOff, text: '100% offline — seus dados ficam no aparelho' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm text-foreground">{text}</p>
                </div>
              ))}
            </div>
            <Button size="lg" className="w-full" onClick={() => setStep(1)}>
              Começar
            </Button>
          </div>
        )}

        {/* Step 1 — Goal + weight */}
        {step === 1 && (
          <div className="flex flex-1 flex-col justify-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Qual é o seu objetivo?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Usamos isso para sugerir suas metas de calorias
              </p>
            </div>
            <div className="space-y-2">
              {GOALS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setGoal(g.key)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left transition-colors',
                    goal === g.key
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{g.label}</p>
                    <p className="text-xs text-muted-foreground">{g.description}</p>
                  </div>
                  {goal === g.key && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Peso atual (kg) — opcional
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="75.0"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Meta de peso (kg) — opcional
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="72.0"
                  className={inputClass}
                />
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={goToMacros}>
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2 — Macro targets */}
        {step === 2 && (
          <div className="flex flex-1 flex-col justify-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Metas diárias</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasWeight
                  ? 'Sugeridas a partir do seu peso e objetivo — ajuste como quiser'
                  : 'Ajuste suas metas de calorias e macros (dá para mudar depois)'}
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Calorias (kcal)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={kcal}
                  onChange={(e) => setKcal(e.target.value)}
                  className={cn(inputClass, 'text-lg font-semibold')}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Proteína (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Carbs (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Gordura (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={() => setStep(3)}>
              Continuar
            </Button>
          </div>
        )}

        {/* Step 3 — First workout */}
        {step === 3 && (
          <div className="flex flex-1 flex-col justify-center gap-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Tudo pronto!</h2>
                <p className="mt-1 text-sm text-muted-foreground px-4">
                  Que tal montar seu primeiro treino agora? Leva menos de um minuto.
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              <Button size="lg" className="w-full gap-2" onClick={() => finish(true)}>
                <Plus className="h-4 w-4" />
                Criar meu primeiro treino
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => finish(false)}>
                Explorar o app primeiro
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
