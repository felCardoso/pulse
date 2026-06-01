import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { v4 as uuid } from "uuid"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { name, sets, reps, weight, duration } = body

  const count = await prisma.exercise.count({ where: { workoutId: params.id } })
  const exercise = await prisma.exercise.create({
    data: { id: uuid(), workoutId: params.id, name, sets, reps, weight, duration, order: count },
  })
  return NextResponse.json(exercise, { status: 201 })
}
