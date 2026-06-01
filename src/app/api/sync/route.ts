import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

const tableMap = {
  Routine: () => prisma.routine,
  Workout: () => prisma.workout,
  Meal: () => prisma.meal,
  Exercise: () => prisma.exercise,
}

export async function POST(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const pending = await prisma.syncQueue.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 50,
  })

  const results = { processed: 0, errors: 0 }

  for (const item of pending) {
    try {
      const data = JSON.parse(item.data)
      const getRepo = tableMap[item.table as keyof typeof tableMap]
      if (!getRepo) continue
      const repo = getRepo() as unknown as {
        delete: (args: { where: { id: string } }) => Promise<unknown>
        create: (args: { data: unknown }) => Promise<unknown>
        update: (args: { where: { id: string }; data: unknown }) => Promise<unknown>
      }

      if (item.operation === "delete") {
        await repo.delete({ where: { id: item.recordId } }).catch(() => null)
      } else if (item.operation === "create") {
        await repo.create({ data }).catch(() => null)
      } else {
        await repo.update({ where: { id: item.recordId }, data }).catch(() => null)
      }

      await prisma.syncQueue.delete({ where: { id: item.id } })
      results.processed++
    } catch {
      await prisma.syncQueue.update({
        where: { id: item.id },
        data: { retries: item.retries + 1, lastError: "Sync failed" },
      })
      results.errors++
    }
  }

  return NextResponse.json(results)
}
