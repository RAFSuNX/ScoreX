/*
  Warnings:

  - You are about to drop the column `answers` on the `ExamAttempt` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ExamAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "currentStep" TEXT,
ADD COLUMN     "generationError" TEXT,
ADD COLUMN     "generationStatus" "GenerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ExamAttempt" DROP COLUMN "answers",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentQuestionIndex" INTEGER DEFAULT 0,
ADD COLUMN     "flaggedQuestions" JSONB,
ADD COLUMN     "inProgressAnswers" JSONB,
ADD COLUMN     "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN     "submittedAnswers" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "score" DROP NOT NULL,
ALTER COLUMN "maxScore" DROP NOT NULL,
ALTER COLUMN "percentage" DROP NOT NULL,
ALTER COLUMN "timeSpent" DROP NOT NULL,
ALTER COLUMN "completedAt" DROP NOT NULL,
ALTER COLUMN "completedAt" DROP DEFAULT;
