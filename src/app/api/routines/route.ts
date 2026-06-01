import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { v4 as uuid } from "uuid"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  const day = req.nextUrl.searchParams.get("day")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const routines = await prisma.routine.findMany({
    where: { userId, ...(day ? { day } : {}) },
    orderBy: [{ day: "asc" }, { time: "asc" }],
  })
  return NextResponse.json(routines)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, name, description, day, time } = body
  if (!userId || !name || !day)
    return NextResponse.json({ error: "userId, name, day required" }, { status: 400 })

  let user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    user = await prisma.user.create({
      data: { id: userId, email: body.email ?? `${userId}@local`, name: body.name },
    })
  }

  const routine = await prisma.routine.create({
    data: { id: uuid(), userId, name, description, day, time, syncStatus: "synced" },
  })
  return NextResponse.json(routine, { status: 201 })
}
