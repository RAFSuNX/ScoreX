/*
  Warnings:

  - Added the required column `updatedAt` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'FILL_IN_THE_BLANK';

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_examId_fkey";

-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ExamAttempt" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "questionBankId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "examId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionBank_userId_idx" ON "QuestionBank"("userId");

-- CreateIndex
CREATE INDEX "QuestionBank_userId_subject_idx" ON "QuestionBank"("userId", "subject");

-- CreateIndex
CREATE INDEX "Question_examId_idx" ON "Question"("examId");

-- CreateIndex
CREATE INDEX "Question_questionBankId_idx" ON "Question"("questionBankId");

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;
