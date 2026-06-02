import type { Workout, WorkoutFormData, ExerciseFormData, Exercise, SetLog } from "@/types"

export async function createWorkout(userId: string, data: WorkoutFormData): Promise<Workout> {
  const res = await fetch("/api/workouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...data }),
  })
  if (!res.ok) throw new Error("Failed to create workout")
  return res.json()
}

export async function updateWorkout(id: string, data: Partial<WorkoutFormData>): Promise<Workout> {
  const res = await fetch(`/api/workouts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update workout")
  return res.json()
}

export async function deleteWorkout(id: string): Promise<void> {
  const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete workout")
}

export async function getWorkoutsByUser(userId: string): Promise<Workout[]> {
  const res = await fetch(`/api/workouts?userId=${userId}`)
  if (!res.ok) throw new Error("Failed to fetch workouts")
  return res.json()
}

export async function addExercise(workoutId: string, data: ExerciseFormData): Promise<Exercise> {
  const res = await fetch(`/api/workouts/${workoutId}/exercises`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to add exercise")
  return res.json()
}

export async function updateExercise(
  workoutId: string,
  exerciseId: string,
  data: Partial<ExerciseFormData & { completed: boolean; setsLog: string }>
): Promise<Exercise> {
  const res = await fetch(`/api/workouts/${workoutId}/exercises/${exerciseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update exercise")
  return res.json()
}

export async function deleteExercise(workoutId: string, exerciseId: string): Promise<void> {
  const res = await fetch(`/api/workouts/${workoutId}/exercises/${exerciseId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete exercise")
}

export function parseSetsLog(raw: string): SetLog[] {
  try { return JSON.parse(raw) } catch { return [] }
}
