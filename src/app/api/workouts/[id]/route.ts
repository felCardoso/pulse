import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const workout = await prisma.workout.update({
    where: { id: params.id },
    data: { ...body, updatedAt: new Date() },
    include: { exercises: { orderBy: { order: "asc" } } },
  })
  return NextResponse.json(workout)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.workout.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
