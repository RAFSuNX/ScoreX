import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AttemptStatus } from '@prisma/client';

const saveProgressSchema = z.object({
  inProgressAnswers: z.record(z.string(), z.string()).optional(),
  currentTimeSpent: z.number().int().optional(),
  currentQuestionIndex: z.number().int().optional(),
  flaggedQuestions: z.array(z.string()).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const examId = params.id;
    const userId = session.user.id;

    if (!examId) {
      return NextResponse.json({ message: 'Exam ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { inProgressAnswers, currentTimeSpent, currentQuestionIndex, flaggedQuestions } = saveProgressSchema.parse(body);

    // Find an existing IN_PROGRESS attempt for this user and exam
    let attempt = await prisma.examAttempt.findFirst({
      where: {
        userId: userId,
        examId: examId,
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    if (attempt) {
      // Update existing attempt
      attempt = await prisma.examAttempt.update({
        where: { id: attempt.id },
        data: {
          inProgressAnswers,
          currentTimeSpent,
          currentQuestionIndex,
          flaggedQuestions,
          updatedAt: new Date(),
        },
      });
    } else {
      // No IN_PROGRESS attempt found, create a new one
      attempt = await prisma.examAttempt.create({
        data: {
          userId: userId,
          examId: examId,
          status: AttemptStatus.IN_PROGRESS,
          inProgressAnswers,
          currentTimeSpent,
          currentQuestionIndex,
          flaggedQuestions,
        },
      });
    }

    return NextResponse.json(attempt, { status: 200 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error('Error saving exam progress:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
