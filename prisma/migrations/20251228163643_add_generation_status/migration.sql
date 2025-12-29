/*
  Warnings:

  - You are about to drop the column `answers` on the `ExamAttempt` table. All the data in the column will be lost.

*/
-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for AttemptStatus if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable Exam - Add columns with defaults
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "currentStep" TEXT;
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "generationError" TEXT;
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "generationStatus" "GenerationStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable ExamAttempt
ALTER TABLE "ExamAttempt" DROP COLUMN IF EXISTS "answers";
ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "currentQuestionIndex" INTEGER DEFAULT 0;
ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "flaggedQuestions" JSONB;
ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "inProgressAnswers" JSONB;
ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS';
ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "submittedAnswers" JSONB;
ALTER TABLE "ExamAttempt" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Alter columns to make them nullable
ALTER TABLE "ExamAttempt" ALTER COLUMN "score" DROP NOT NULL;
ALTER TABLE "ExamAttempt" ALTER COLUMN "maxScore" DROP NOT NULL;
ALTER TABLE "ExamAttempt" ALTER COLUMN "percentage" DROP NOT NULL;
ALTER TABLE "ExamAttempt" ALTER COLUMN "timeSpent" DROP NOT NULL;
ALTER TABLE "ExamAttempt" ALTER COLUMN "completedAt" DROP NOT NULL;
ALTER TABLE "ExamAttempt" ALTER COLUMN "completedAt" DROP DEFAULT;
