import type { Routine, RoutineFormData, DayOfWeek } from "@/types"

export async function createRoutine(userId: string, data: RoutineFormData): Promise<Routine> {
  const res = await fetch("/api/routines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...data }),
  })
  if (!res.ok) throw new Error("Failed to create routine")
  return res.json()
}

export async function updateRoutine(id: string, data: Partial<RoutineFormData>): Promise<Routine> {
  const res = await fetch(`/api/routines/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update routine")
  return res.json()
}

export async function deleteRoutine(id: string): Promise<void> {
  const res = await fetch(`/api/routines/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete routine")
}

export async function checkRoutine(id: string, completed: boolean): Promise<Routine> {
  const res = await fetch(`/api/routines/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed, completedAt: completed ? new Date() : null }),
  })
  if (!res.ok) throw new Error("Failed to update routine")
  return res.json()
}

export async function getRoutinesByUser(userId: string): Promise<Routine[]> {
  const res = await fetch(`/api/routines?userId=${userId}`)
  if (!res.ok) throw new Error("Failed to fetch routines")
  return res.json()
}

export async function getRoutinesByDay(userId: string, day: DayOfWeek): Promise<Routine[]> {
  const res = await fetch(`/api/routines?userId=${userId}&day=${day}`)
  if (!res.ok) throw new Error("Failed to fetch routines")
  return res.json()
}
