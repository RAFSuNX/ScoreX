import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { examId } = params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        userId: true,
        generationStatus: true,
        generationError: true,
        currentStep: true,
        questions: {
          select: { id: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    // Verify ownership
    if (exam.userId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      examId: exam.id,
      status: exam.generationStatus,
      currentStep: exam.currentStep,
      error: exam.generationError,
      questionCount: exam.questions.length,
    });

  } catch (error: unknown) {
    logger.error('Status check error', error, { examId: params.examId });
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
