"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateWorkout } from "@/hooks/useWorkout"
import type { WorkoutFormData } from "@/types"

export default function WorkoutForm() {
  const router = useRouter()
  const { mutateAsync, isPending, error } = useCreateWorkout()
  const [form, setForm] = useState<WorkoutFormData>({ name: "", description: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await mutateAsync(form)
    router.push("/treinos")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          required
          placeholder="Ex: Peito e Tríceps"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Detalhes do treino..."
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
