import type { Meal, MealFormData } from "@/types"

export async function createMeal(userId: string, data: MealFormData): Promise<Meal> {
  const res = await fetch("/api/meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...data }),
  })
  if (!res.ok) throw new Error("Failed to create meal")
  return res.json()
}

export async function updateMeal(id: string, data: Partial<MealFormData>): Promise<Meal> {
  const res = await fetch(`/api/meals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update meal")
  return res.json()
}

export async function deleteMeal(id: string): Promise<void> {
  const res = await fetch(`/api/meals/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete meal")
}

export async function getMealsByUser(userId: string): Promise<Meal[]> {
  const res = await fetch(`/api/meals?userId=${userId}`)
  if (!res.ok) throw new Error("Failed to fetch meals")
  return res.json()
}

export async function getMealsByDate(userId: string, date: string): Promise<Meal[]> {
  const res = await fetch(`/api/meals?userId=${userId}&date=${date}`)
  if (!res.ok) throw new Error("Failed to fetch meals")
  return res.json()
}
