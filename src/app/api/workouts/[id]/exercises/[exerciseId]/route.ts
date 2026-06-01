import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; exerciseId: string } }
) {
  const body = await req.json()
  const exercise = await prisma.exercise.update({
    where: { id: params.exerciseId },
    data: { ...body, updatedAt: new Date() },
  })
  return NextResponse.json(exercise)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; exerciseId: string } }
) {
  await prisma.exercise.delete({ where: { id: params.exerciseId } })
  return NextResponse.json({ ok: true })
}
