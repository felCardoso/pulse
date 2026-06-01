import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { v4 as uuid } from "uuid"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  const date = req.nextUrl.searchParams.get("date")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const where: Record<string, unknown> = { userId }
  if (date) {
    const d = new Date(date)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    where.date = { gte: d, lt: next }
  }

  const meals = await prisma.meal.findMany({ where, orderBy: { date: "desc" } })
  return NextResponse.json(meals)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, name, description, mealType, calories, protein, carbs, fat, date } = body
  if (!userId || !name || !mealType)
    return NextResponse.json({ error: "userId, name, mealType required" }, { status: 400 })

  let user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    user = await prisma.user.create({ data: { id: userId, email: body.email ?? `${userId}@local` } })
  }

  const meal = await prisma.meal.create({
    data: {
      id: uuid(),
      userId,
      name,
      description,
      mealType,
      calories,
      protein,
      carbs,
      fat,
      date: date ? new Date(date) : new Date(),
      syncStatus: "synced",
    },
  })
  return NextResponse.json(meal, { status: 201 })
}
