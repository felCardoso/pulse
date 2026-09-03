'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Disc, Dumbbell, Repeat, TrendingUp, WifiOff, ChevronLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEchoStore } from '@/store/echo-store'
import { useStoreHydrated } from '@/hooks/useStoreHydrated'
import { getLocalDateStr } from '@/utils/format'

export default function OnboardingFlow() {
  const router = useRouter()

  const onboardingCompleted = useEchoStore((s) => s.onboardingCompleted)
  const completeOnboarding = useEchoStore((s) => s.completeOnboarding)
  const addBodyMeasurement = useEchoStore((s) => s.addBodyMeasurement)
  const setWeightGoal = useEchoStore((s) => s.setWeightGoal)

  // Anything already in the store means this isn't a first launch.
  const hasData = useEchoStore(
    (s) =>
      s.templates.length > 0 ||
      s.sessions.length > 0 ||
      s.habits.length > 0 ||
      s.bodyMeasurements.length > 0
  )

  // Wait for localStorage hydration so existing users never see a flash.
  // persist API is unavailable during SSR/prerender — only touch it in
  // an effect (this is what broke the Vercel build when accessed in render).
  const hydrated = useStoreHydrated()

  // Existing users (data present but flag missing) skip silently.
  useEffect(() => {
    if (hydrated && !onboardingCompleted && hasData) completeOnboarding()
  }, [hydrated, onboardingCompleted, hasData, completeOnboarding])

  const [step, setStep] = useState(0)
  const [weight, setWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')

  if (!hydrated || onboardingCompleted || hasData) return null

  const weightNum = parseFloat(weight)
  const hasWeight = weight !== '' && !isNaN(weightNum) && weightNum > 0

  const finish = (createWorkout: boolean) => {
    if (hasWeight) {
      addBodyMeasurement({
        date: getLocalDateStr(),
        weightKg: Math.round(weightNum * 10) / 10,
      })
    }
    const goalNum = parseFloat(targetWeight)
    if (targetWeight !== '' && !isNaN(goalNum) && goalNum > 0) {
      setWeightGoal(Math.round(goalNum * 10) / 10)
    }
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
            {[0, 1, 2].map((i) => (
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
              <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#1e293b]">
                <Disc className="h-14 w-14 text-primary" strokeWidth={2} />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">Bem-vindo ao Echo</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Treino, rotinas e progresso corporal em um só lugar
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: Dumbbell, text: 'Registre treinos com 1 toque por série' },
                { icon: Repeat, text: 'Transforme hábitos em rotina em 30 dias' },
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

        {/* Step 1 — Weight */}
        {step === 1 && (
          <div className="flex flex-1 flex-col justify-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Seu peso atual</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Opcional — dá para registrar depois na aba Progresso
              </p>
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
            <Button size="lg" className="w-full" onClick={() => setStep(2)}>
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2 — First workout */}
        {step === 2 && (
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
