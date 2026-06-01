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
import { useCreateMeal } from "@/hooks/useDiet"
import type { MealFormData, MealType } from "@/types"

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Café da Manhã" },
  { value: "lunch", label: "Almoço" },
  { value: "dinner", label: "Jantar" },
  { value: "snack", label: "Lanche" },
]

export default function MealForm() {
  const router = useRouter()
  const { mutateAsync, isPending, error } = useCreateMeal()
  const [form, setForm] = useState<MealFormData>({
    name: "",
    mealType: "breakfast",
    calories: undefined,
    protein: undefined,
    carbs: undefined,
    fat: undefined,
  })

  function numOrUndef(v: string) {
    return v ? Number(v) : undefined
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await mutateAsync(form)
    router.push("/dieta")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          required
          placeholder="Ex: Frango com arroz"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Tipo de Refeição *</Label>
        <Select
          value={form.mealType}
          onValueChange={(v) => setForm((f) => ({ ...f, mealType: v as MealType }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEAL_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="desc">Descrição</Label>
        <Textarea
          id="desc"
          placeholder="Ingredientes, porção..."
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cal">Calorias (kcal)</Label>
          <Input
            id="cal"
            type="number"
            min={0}
            placeholder="500"
            value={form.calories ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, calories: numOrUndef(e.target.value) }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prot">Proteína (g)</Label>
          <Input
            id="prot"
            type="number"
            min={0}
            step={0.1}
            placeholder="30"
            value={form.protein ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, protein: numOrUndef(e.target.value) }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="carbs">Carboidratos (g)</Label>
          <Input
            id="carbs"
            type="number"
            min={0}
            step={0.1}
            placeholder="60"
            value={form.carbs ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, carbs: numOrUndef(e.target.value) }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fat">Gorduras (g)</Label>
          <Input
            id="fat"
            type="number"
            min={0}
            step={0.1}
            placeholder="15"
            value={form.fat ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, fat: numOrUndef(e.target.value) }))}
          />
        </div>
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
