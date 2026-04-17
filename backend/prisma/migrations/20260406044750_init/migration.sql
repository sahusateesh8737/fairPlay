/*
  Warnings:

  - A unique constraint covering the columns `[registration_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "description" TEXT,
ADD COLUMN     "difficulty" TEXT DEFAULT 'Medium',
ADD COLUMN     "language" TEXT DEFAULT 'JavaScript',
ADD COLUMN     "max_score" INTEGER DEFAULT 100;

-- AlterTable
ALTER TABLE "cheat_logs" ADD COLUMN     "screenshot" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "department" TEXT,
ADD COLUMN     "registration_number" TEXT,
ADD COLUMN     "roll_number" TEXT,
ADD COLUMN     "semester" INTEGER,
ADD COLUMN     "year" INTEGER;

-- CreateTable
CREATE TABLE "system_configs" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_registration_number_key" ON "users"("registration_number");
