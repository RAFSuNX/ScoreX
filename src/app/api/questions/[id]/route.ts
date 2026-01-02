import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { QuestionType } from '@prisma/client';

export const dynamic = "force-dynamic";

const updateQuestionSchema = z.object({
  questionText: z.string().min(5, 'Question text must be at least 5 characters').optional(),
  questionType: z.nativeEnum(QuestionType).optional(),
  options: z.any().optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required').optional(),
  explanation: z.string().optional(),
  points: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
});

type UpdateQuestionPayload = z.infer<typeof updateQuestionSchema>;

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  let session: Awaited<ReturnType<typeof getAuthSession>> = null;
  try {
    session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const userId = session.user.id;
    const questionId = params.id;

    // Fetch user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user has access to Question Bank (Pro feature)
    if (user.plan === 'FREE') {
      return NextResponse.json(
        { message: 'Editing questions is a Pro feature. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // Verify that the question belongs to the user
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        questionBank: true,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Check ownership
    if (existingQuestion.questionBank?.userId !== userId) {
      return NextResponse.json({ message: 'Unauthorized - You do not own this question' }, { status: 403 });
    }

    const body = (await req.json()) as UpdateQuestionPayload;
    const validatedData = updateQuestionSchema.parse(body);

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: validatedData,
    });

    logger.info('Question updated successfully', {
      questionId,
      userId,
    });

    return NextResponse.json(updatedQuestion, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('Question update validation failed', { issues: error.issues });
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    logger.error('Question update error', error, { userId: session?.user?.id });
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  let session: Awaited<ReturnType<typeof getAuthSession>> = null;
  try {
    session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const userId = session.user.id;
    const questionId = params.id;

    // Fetch user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user has access to Question Bank (Pro feature)
    if (user.plan === 'FREE') {
      return NextResponse.json(
        { message: 'Deleting questions is a Pro feature. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // Verify that the question belongs to the user
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        questionBank: true,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Check ownership
    if (existingQuestion.questionBank?.userId !== userId) {
      return NextResponse.json({ message: 'Unauthorized - You do not own this question' }, { status: 403 });
    }

    // Delete the question
    await prisma.question.delete({
      where: { id: questionId },
    });

    logger.info('Question deleted successfully', {
      questionId,
      userId,
    });

    return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    logger.error('Question deletion error', error, { userId: session?.user?.id });
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
