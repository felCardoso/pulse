import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { v4 as uuid } from "uuid"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const count = await prisma.syncQueue.count({ where: { userId } })
  return NextResponse.json({ count })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, operation, table, recordId, data } = body
  if (!userId || !operation || !table || !recordId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const item = await prisma.syncQueue.create({
    data: { id: uuid(), userId, operation, table, recordId, data: data ?? "{}" },
  })
  return NextResponse.json(item, { status: 201 })
}
