-- DailyPulse: add new productivity tables
-- Run this in Supabase SQL Editor → safe to re-run (uses IF NOT EXISTS)

-- RoutineItem (sub-items within a Routine)
CREATE TABLE IF NOT EXISTS "RoutineItem" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoutineItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "RoutineItem_routineId_idx" ON "RoutineItem"("routineId");
CREATE INDEX IF NOT EXISTS "RoutineItem_routineId_order_idx" ON "RoutineItem"("routineId", "order");
ALTER TABLE "RoutineItem" DROP CONSTRAINT IF EXISTS "RoutineItem_routineId_fkey";
ALTER TABLE "RoutineItem" ADD CONSTRAINT "RoutineItem_routineId_fkey"
    FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Task
CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Task_userId_idx" ON "Task"("userId");
CREATE INDEX IF NOT EXISTS "Task_userId_completed_idx" ON "Task"("userId", "completed");
CREATE INDEX IF NOT EXISTS "Task_userId_dueDate_idx" ON "Task"("userId", "dueDate");
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_userId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Habit
CREATE TABLE IF NOT EXISTS "Habit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#8b5cf6',
    "icon" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "targetDays" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Habit_userId_idx" ON "Habit"("userId");
ALTER TABLE "Habit" DROP CONSTRAINT IF EXISTS "Habit_userId_fkey";
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- HabitLog
CREATE TABLE IF NOT EXISTS "HabitLog" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HabitLog_habitId_idx" ON "HabitLog"("habitId");
CREATE INDEX IF NOT EXISTS "HabitLog_habitId_date_idx" ON "HabitLog"("habitId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "HabitLog_habitId_date_key" ON "HabitLog"("habitId", "date");
ALTER TABLE "HabitLog" DROP CONSTRAINT IF EXISTS "HabitLog_habitId_fkey";
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey"
    FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Note
CREATE TABLE IF NOT EXISTS "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Note_userId_idx" ON "Note"("userId");
CREATE INDEX IF NOT EXISTS "Note_userId_pinned_idx" ON "Note"("userId", "pinned");
ALTER TABLE "Note" DROP CONSTRAINT IF EXISTS "Note_userId_fkey";
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Goal
CREATE TABLE IF NOT EXISTS "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT,
    "weekStart" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Goal_userId_idx" ON "Goal"("userId");
CREATE INDEX IF NOT EXISTS "Goal_userId_weekStart_idx" ON "Goal"("userId", "weekStart");
ALTER TABLE "Goal" DROP CONSTRAINT IF EXISTS "Goal_userId_fkey";
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
