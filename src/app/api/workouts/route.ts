import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { v4 as uuid } from "uuid"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const workouts = await prisma.workout.findMany({
    where: { userId },
    include: { exercises: { orderBy: { order: "asc" } } },
    orderBy: { date: "desc" },
  })
  return NextResponse.json(workouts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, name, description, date } = body
  if (!userId || !name) return NextResponse.json({ error: "userId, name required" }, { status: 400 })

  let user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    user = await prisma.user.create({
      data: { id: userId, email: body.email ?? `${userId}@local` },
    })
  }

  const workout = await prisma.workout.create({
    data: {
      id: uuid(),
      userId,
      name,
      description,
      date: date ? new Date(date) : new Date(),
      syncStatus: "synced",
    },
    include: { exercises: true },
  })
  return NextResponse.json(workout, { status: 201 })
}
