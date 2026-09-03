'use client'

import { useState } from 'react'
import { Plus, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import HabitCard from '@/components/habits/HabitCard'
import AddHabitDialog from '@/components/habits/AddHabitDialog'

export default function RotinasPage() {
  const habits = usePulseStore((s) => s.habits)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="space-y-6 pb-8">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-foreground">Rotinas</h1>
        <p className="text-xs text-muted-foreground mt-1">
          30 dias para virar hábito. Escolha dias úteis ou todos os dias por rotina.
        </p>
      </div>

      <Button onClick={() => setShowAdd(true)} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Nova rotina
      </Button>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
          <Repeat className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground max-w-[220px]">
            Crie uma rotina e marque os dias úteis em que a cumprir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}

      {showAdd && <AddHabitDialog onClose={() => setShowAdd(false)} />}
    </div>
  )
}
