-- DailyPulse: full schema migration
-- Safe to re-run on empty or partially-populated database (IF NOT EXISTS guards throughout)

-- ─── User ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "User" (
    "id"        TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "name"      TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- ─── Routine ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Routine" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "day"         TEXT NOT NULL,
    "time"        TEXT,
    "completed"   BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "syncStatus"  TEXT NOT NULL DEFAULT 'pending',
    "remoteId"    TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Routine_userId_idx"     ON "Routine"("userId");
CREATE INDEX IF NOT EXISTS "Routine_userId_day_idx" ON "Routine"("userId", "day");
CREATE INDEX IF NOT EXISTS "Routine_remoteId_idx"   ON "Routine"("remoteId");
ALTER TABLE "Routine" DROP CONSTRAINT IF EXISTS "Routine_userId_fkey";
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── RoutineItem ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "RoutineItem" (
    "id"        TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order"     INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoutineItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "RoutineItem_routineId_idx"       ON "RoutineItem"("routineId");
CREATE INDEX IF NOT EXISTS "RoutineItem_routineId_order_idx" ON "RoutineItem"("routineId", "order");
ALTER TABLE "RoutineItem" DROP CONSTRAINT IF EXISTS "RoutineItem_routineId_fkey";
ALTER TABLE "RoutineItem" ADD CONSTRAINT "RoutineItem_routineId_fkey"
    FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Workout ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Workout" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "date"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed"   BOOLEAN NOT NULL DEFAULT false,
    "syncStatus"  TEXT NOT NULL DEFAULT 'pending',
    "remoteId"    TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Workout_userId_idx"      ON "Workout"("userId");
CREATE INDEX IF NOT EXISTS "Workout_userId_date_idx" ON "Workout"("userId", "date");
CREATE INDEX IF NOT EXISTS "Workout_remoteId_idx"    ON "Workout"("remoteId");
ALTER TABLE "Workout" DROP CONSTRAINT IF EXISTS "Workout_userId_fkey";
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Exercise ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Exercise" (
    "id"        TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "sets"      INTEGER,
    "reps"      INTEGER,
    "weight"    DOUBLE PRECISION,
    "duration"  INTEGER,
    "setsLog"   TEXT NOT NULL DEFAULT '[]',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order"     INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Exercise_workoutId_idx" ON "Exercise"("workoutId");
ALTER TABLE "Exercise" DROP CONSTRAINT IF EXISTS "Exercise_workoutId_fkey";
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_workoutId_fkey"
    FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add setsLog column if table already existed without it
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='Exercise' AND column_name='setsLog'
  ) THEN
    ALTER TABLE "Exercise" ADD COLUMN "setsLog" TEXT NOT NULL DEFAULT '[]';
  END IF;
END $$;

-- ─── Meal ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Meal" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "date"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealType"    TEXT NOT NULL,
    "calories"    DOUBLE PRECISION,
    "protein"     DOUBLE PRECISION,
    "carbs"       DOUBLE PRECISION,
    "fat"         DOUBLE PRECISION,
    "syncStatus"  TEXT NOT NULL DEFAULT 'pending',
    "remoteId"    TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Meal_userId_idx"      ON "Meal"("userId");
CREATE INDEX IF NOT EXISTS "Meal_userId_date_idx" ON "Meal"("userId", "date");
CREATE INDEX IF NOT EXISTS "Meal_remoteId_idx"    ON "Meal"("remoteId");
ALTER TABLE "Meal" DROP CONSTRAINT IF EXISTS "Meal_userId_fkey";
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Task ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Task" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "priority"    TEXT NOT NULL DEFAULT 'medium',
    "dueDate"     TIMESTAMP(3),
    "completed"   BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "syncStatus"  TEXT NOT NULL DEFAULT 'pending',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Task_userId_idx"           ON "Task"("userId");
CREATE INDEX IF NOT EXISTS "Task_userId_completed_idx" ON "Task"("userId", "completed");
CREATE INDEX IF NOT EXISTS "Task_userId_dueDate_idx"   ON "Task"("userId", "dueDate");
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_userId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Habit ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Habit" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "color"       TEXT NOT NULL DEFAULT '#8b5cf6',
    "icon"        TEXT,
    "frequency"   TEXT NOT NULL DEFAULT 'daily',
    "targetDays"  TEXT NOT NULL DEFAULT '[]',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Habit_userId_idx" ON "Habit"("userId");
ALTER TABLE "Habit" DROP CONSTRAINT IF EXISTS "Habit_userId_fkey";
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── HabitLog ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "HabitLog" (
    "id"        TEXT NOT NULL,
    "habitId"   TEXT NOT NULL,
    "date"      TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HabitLog_habitId_idx"             ON "HabitLog"("habitId");
CREATE INDEX IF NOT EXISTS "HabitLog_habitId_date_idx"        ON "HabitLog"("habitId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "HabitLog_habitId_date_key" ON "HabitLog"("habitId", "date");
ALTER TABLE "HabitLog" DROP CONSTRAINT IF EXISTS "HabitLog_habitId_fkey";
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey"
    FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Note ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Note" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "title"      TEXT,
    "content"    TEXT NOT NULL,
    "pinned"     BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Note_userId_idx"        ON "Note"("userId");
CREATE INDEX IF NOT EXISTS "Note_userId_pinned_idx" ON "Note"("userId", "pinned");
ALTER TABLE "Note" DROP CONSTRAINT IF EXISTS "Note_userId_fkey";
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Goal ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Goal" (
    "id"           TEXT NOT NULL,
    "userId"       TEXT NOT NULL,
    "title"        TEXT NOT NULL,
    "targetValue"  DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit"         TEXT,
    "weekStart"    TEXT NOT NULL,
    "completed"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Goal_userId_idx"           ON "Goal"("userId");
CREATE INDEX IF NOT EXISTS "Goal_userId_weekStart_idx" ON "Goal"("userId", "weekStart");
ALTER TABLE "Goal" DROP CONSTRAINT IF EXISTS "Goal_userId_fkey";
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── SyncQueue ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SyncQueue" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "table"     TEXT NOT NULL,
    "recordId"  TEXT NOT NULL,
    "data"      TEXT NOT NULL,
    "retries"   INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SyncQueue_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SyncQueue_userId_idx"       ON "SyncQueue"("userId");
CREATE INDEX IF NOT EXISTS "SyncQueue_userId_table_idx" ON "SyncQueue"("userId", "table");
ALTER TABLE "SyncQueue" DROP CONSTRAINT IF EXISTS "SyncQueue_userId_fkey";
ALTER TABLE "SyncQueue" ADD CONSTRAINT "SyncQueue_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
