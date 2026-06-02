import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { exercises = [] } = await req.json()

    await prisma.$transaction(async (tx) => {
      for (const ex of exercises as { id: string; setsLog: string; completed: boolean }[]) {
        await tx.exercise.update({
          where: { id: ex.id },
          data: { setsLog: ex.setsLog, completed: ex.completed },
        })
      }
      await tx.workout.update({
        where: { id: params.id },
        data: { completed: true },
      })
    })

    const workout = await prisma.workout.findUnique({
      where: { id: params.id },
      include: { exercises: { orderBy: { order: "asc" } } },
    })
    return NextResponse.json(workout)
  } catch (err) {
    console.error("PATCH /api/workouts/[id]/finalize:", err)
    return NextResponse.json({ error: "Failed to finalize workout" }, { status: 500 })
  }
}
