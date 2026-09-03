'use client'

import { useEffect, useState } from 'react'
import { Plus, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEchoStore, isWeekday } from '@/store/echo-store'
import HabitCard from '@/components/habits/HabitCard'
import AddHabitDialog from '@/components/habits/AddHabitDialog'
import { requestNotificationPermission, notifyRoutineReminder } from '@/lib/notifications'

export default function RotinasPage() {
  const habits = useEchoStore((s) => s.habits)
  const getHabitProgress = useEchoStore((s) => s.getHabitProgress)
  const routineReminders = useEchoStore((s) => s.settings.routineReminders)
  const [showAdd, setShowAdd] = useState(false)

  // Best-effort routine reminder: fires at most once/day, only while the
  // app is open (no push server behind this, so no true background alert).
  useEffect(() => {
    requestNotificationPermission()
    if (!routineReminders) return
    const today = new Date().toISOString().split('T')[0]
    const pending = habits.filter((h) => {
      const countsToday = h.frequency === 'daily' || isWeekday(today)
      return countsToday && !getHabitProgress(h.id).checkedToday
    }).length
    notifyRoutineReminder(pending)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineReminders])

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
