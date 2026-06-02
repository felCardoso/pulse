import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { v4 as uuid } from "uuid"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { name, sets, reps, weight, duration } = body

  // Build per-set log initialised with the target weight/reps, all not done
  const setsLog = sets
    ? JSON.stringify(
        Array.from({ length: sets }, () => ({
          weight: weight ?? 0,
          reps: reps ?? 0,
          done: false,
        }))
      )
    : "[]"

  const count = await prisma.exercise.count({ where: { workoutId: params.id } })
  const exercise = await prisma.exercise.create({
    data: { id: uuid(), workoutId: params.id, name, sets, reps, weight, duration, setsLog, order: count },
  })
  return NextResponse.json(exercise, { status: 201 })
}
