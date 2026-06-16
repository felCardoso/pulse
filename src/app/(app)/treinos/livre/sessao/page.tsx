'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ActiveWorkoutHeader from '@/components/session/ActiveWorkoutHeader'
import ExerciseTracker from '@/components/session/ExerciseTracker'
import RestTimer from '@/components/session/RestTimer'
import AddExerciseSheet from '@/components/session/AddExerciseSheet'
import { useActiveWorkout } from '@/hooks/useActiveWorkout'
import { usePulseStore } from '@/store/pulse-store'
import type { SessionExercise } from '@/types'

export default function LivreSessaoPage() {
  const router = useRouter()
  const {
    activeSession,
    exercises,
    currentExercise,
    doneCount,
    totalCount,
    isFinishable,
    cancelWorkout,
    finishWorkout,
    addExerciseToActiveSession,
  } = useActiveWorkout()
  const weightUnit = usePulseStore((s) => s.settings.weightUnit)

  const [restActive, setRestActive] = useState(false)
  const [restSeconds, setRestSeconds] = useState(90)
  const [showAddExercise, setShowAddExercise] = useState(true)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <p>Nenhum treino ativo.</p>
        <button onClick={() => router.push('/treinos')} className="mt-4 text-primary text-sm">
          Ir para Treinos
        </button>
      </div>
    )
  }

  const handleSetDone = (seconds: number) => {
    if (seconds > 0) {
      setRestSeconds(seconds)
      setRestActive(true)
    }
  }

  const handleFinish = () => {
    const session = finishWorkout()
    if (session) router.push(`/historico/${session.id}`)
  }

  const handleCancel = () => {
    if (doneCount > 0) setShowCancelConfirm(true)
    else { cancelWorkout(); router.push('/treinos') }
  }

  const handleAddExercise = (exercise: Omit<SessionExercise, 'id' | 'order'>) => {
    addExerciseToActiveSession(exercise)
    setShowAddExercise(false)
  }

  return (
    <>
      <div className="fixed inset-0 z-20 bg-background" />
      <div className="fixed inset-0 z-30 flex flex-col overflow-hidden">
        <ActiveWorkoutHeader
          workoutName={activeSession.name}
          startedAt={activeSession.startedAt}
          progress={{ done: doneCount, total: totalCount }}
          onCancel={handleCancel}
        />
        <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-3">
          {exercises.map((exercise) => (
            <ExerciseTracker
              key={exercise.id}
              exercise={exercise}
              isCurrentExercise={currentExercise?.id === exercise.id}
              weightUnit={weightUnit}
              onSetDone={handleSetDone}
            />
          ))}
          <button
            onClick={() => setShowAddExercise(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adicionar exercício
          </button>
          {isFinishable && (
            <Button onClick={handleFinish} className="w-full gap-2" size="lg">
              <Flag className="h-4 w-4" />
              Finalizar Treino
            </Button>
          )}
        </div>
      </div>
      <RestTimer seconds={restSeconds} isActive={restActive} onEnd={() => setRestActive(false)} onSkip={() => setRestActive(false)} />
      {showAddExercise && (
        <AddExerciseSheet onAdd={handleAddExercise} onClose={() => setShowAddExercise(false)} />
      )}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 space-y-4">
            <h3 className="font-semibold">Cancelar treino?</h3>
            <p className="text-sm text-muted-foreground">O progresso será perdido.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancelConfirm(false)}>Continuar</Button>
              <Button variant="destructive" className="flex-1" onClick={() => { cancelWorkout(); router.push('/treinos') }}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
