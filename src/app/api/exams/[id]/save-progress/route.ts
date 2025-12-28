import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { AttemptStatus } from '@prisma/client';

export const dynamic = "force-dynamic";

const saveProgressSchema = z.object({
  inProgressAnswers: z.record(z.string(), z.string()).optional(),
  currentTimeSpent: z.number().int().optional(), // Frontend sends currentTimeSpent
  currentQuestionIndex: z.number().int().optional(),
  flaggedQuestions: z.array(z.string()).optional(),
});

type SaveProgressPayload = z.infer<typeof saveProgressSchema>;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const examId = params.id;
    const userId = session.user.id;

    if (!examId) {
      return NextResponse.json({ message: 'Exam ID is required' }, { status: 400 });
    }

    const body = (await req.json()) as SaveProgressPayload;
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
          timeSpent: currentTimeSpent, // Map currentTimeSpent to timeSpent column
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
          timeSpent: currentTimeSpent, // Map currentTimeSpent to timeSpent column
          currentQuestionIndex,
          flaggedQuestions,
        },
      });
    }

    // Map timeSpent to currentTimeSpent for frontend compatibility
    const response = {
      ...attempt,
      currentTimeSpent: attempt.timeSpent,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error('Error saving exam progress:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
