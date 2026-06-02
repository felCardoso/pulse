import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    return NextResponse.json({
      ok: true,
      tables: tables.map((t) => t.table_name),
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPreview: process.env.DATABASE_URL?.replace(/:([^@]+)@/, ":***@"),
      },
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: String(err),
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          dbUrlPreview: process.env.DATABASE_URL?.replace(/:([^@]+)@/, ":***@"),
        },
      },
      { status: 500 }
    )
  }
}
