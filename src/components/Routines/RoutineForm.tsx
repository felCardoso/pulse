"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateRoutine } from "@/hooks/useRoutine"
import type { DayOfWeek, RoutineFormData } from "@/types"
import { dayLabel } from "@/utils/date"

const DAYS: DayOfWeek[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]

export default function RoutineForm() {
  const router = useRouter()
  const { mutateAsync, isPending, error } = useCreateRoutine()
  const [form, setForm] = useState<RoutineFormData>({
    name: "",
    description: "",
    day: "monday",
    time: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await mutateAsync(form)
    router.push("/rotinas")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          required
          placeholder="Ex: Meditação matinal"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Detalhes opcionais..."
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Dia da semana *</Label>
        <Select
          value={form.day}
          onValueChange={(v) => setForm((f) => ({ ...f, day: v as DayOfWeek }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((d) => (
              <SelectItem key={d} value={d}>
                {dayLabel(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="time">Horário</Label>
        <Input
          id="time"
          type="time"
          value={form.time ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
