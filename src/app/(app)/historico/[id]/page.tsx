'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Trophy, Dumbbell, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import { formatDuration, formatDate, calcTotalVolume } from '@/utils/format'

export default function SessaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const sessions = usePulseStore((s) => s.sessions)
  const updateSession = usePulseStore((s) => s.updateSession)
  const personalRecords = usePulseStore((s) => s.personalRecords)
  const addTemplate = usePulseStore((s) => s.addTemplate)

  const session = sessions.find((s) => s.id === id)
  const [expandedEx, setExpandedEx] = useState<string | null>(null)
  const [note, setNote] = useState(session?.notes ?? '')
  const [noteSaved, setNoteSaved] = useState(true)
  const [savedAsTemplate, setSavedAsTemplate] = useState(false)

  if (!session) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <p>Sessão não encontrada.</p>
        <Link href="/historico" className="mt-4 inline-block text-primary text-sm">
          Voltar
        </Link>
      </div>
    )
  }

  const totalVolume = calcTotalVolume(session.exercises)
  const completedExercises = session.exercises.filter((e) => e.completed).length

  // PRs achieved in this session
  const sessionPRs = Object.values(personalRecords).filter((pr) => pr.sessionId === session.id)

  const saveNote = () => {
    updateSession(session.id, { notes: note })
    setNoteSaved(true)
  }

  const handleSaveAsTemplate = () => {
    addTemplate({
      name: session.name,
      description: undefined,
      exercises: session.exercises.map((ex, i) => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets.length,
        reps: ex.plannedReps,
        restSeconds: ex.restSeconds,
        order: i,
      })),
    })
    setSavedAsTemplate(true)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/historico" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{session.name}</h1>
          <p className="text-xs text-muted-foreground">{formatDate(session.startedAt)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold text-foreground">
            {session.duration != null ? formatDuration(session.duration) : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">duração</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold text-foreground">{Math.round(totalVolume)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">kg volume</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold text-foreground">{completedExercises}</p>
          <p className="text-xs text-muted-foreground mt-0.5">exercícios</p>
        </div>
      </div>

      {/* PRs */}
      {sessionPRs.length > 0 && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <p className="text-sm font-semibold text-yellow-500">
              {sessionPRs.length} recorde{sessionPRs.length !== 1 ? 's' : ''} pessoal{sessionPRs.length !== 1 ? 'is' : ''} quebrado{sessionPRs.length !== 1 ? 's' : ''}!
            </p>
          </div>
          {sessionPRs.map((pr) => (
            <p key={pr.exerciseName} className="text-xs text-yellow-400/80">
              {pr.exerciseName}: {pr.maxWeight}kg × {Math.round(pr.maxVolume / pr.maxWeight)} reps
            </p>
          ))}
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Exercícios
        </h2>
        {session.exercises.map((ex) => (
          <div key={ex.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
              onClick={() => setExpandedEx(expandedEx === ex.id ? null : ex.id)}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                {ex.completed ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{ex.name}</p>
                <p className="text-xs text-muted-foreground">
                  {ex.sets.filter((s) => s.done).length}/{ex.sets.length} séries
                </p>
              </div>
              {expandedEx === ex.id ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {expandedEx === ex.id && (
              <div className="border-t border-border px-4 pb-3 pt-2 space-y-1.5">
                {ex.sets.map((set) => (
                  <div key={set.id} className="flex items-center gap-3 text-sm">
                    <span className="w-5 text-center text-xs text-muted-foreground">
                      {set.setNumber}
                    </span>
                    <span className={set.done ? 'text-foreground' : 'text-muted-foreground'}>
                      {set.done
                        ? `${set.weight != null ? `${set.weight}kg` : '—'} × ${set.reps ?? '—'}`
                        : 'Não realizada'}
                    </span>
                    {set.done && <Check className="h-3.5 w-3.5 text-primary ml-auto" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Notas da sessão
        </h2>
        <textarea
          value={note}
          onChange={(e) => { setNote(e.target.value); setNoteSaved(false) }}
          placeholder="Como foi o treino? Alguma observação..."
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
          rows={3}
        />
        {!noteSaved && (
          <Button size="sm" onClick={saveNote}>Salvar nota</Button>
        )}
      </div>

      {/* Save as template */}
      {!session.templateId && !savedAsTemplate && (
        <Button variant="outline" className="w-full" onClick={handleSaveAsTemplate}>
          <Dumbbell className="h-4 w-4 mr-2" />
          Salvar como Template
        </Button>
      )}
      {savedAsTemplate && (
        <p className="text-center text-xs text-primary">Template salvo com sucesso!</p>
      )}
    </div>
  )
}
