import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { Plan, QuestionType } from '@prisma/client';

export const dynamic = "force-dynamic";

// Define maximum questions in bank per plan
const QUESTION_BANK_LIMITS: Record<Plan, number> = {
  FREE: 0, // Free users cannot use question bank
  PRO: 500,
  PREMIUM: 99999, // Effectively unlimited
};

const questionSchema = z.object({
  questionText: z.string().min(5, 'Question text must be at least 5 characters'),
  questionType: z.nativeEnum(QuestionType),
  options: z.any().optional(), // JSON field for options
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().optional(),
  points: z.number().int().positive().default(1),
  order: z.number().int().nonnegative(),
});

const createQuestionBankSchema = z.object({
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

type CreateQuestionBankPayload = z.infer<typeof createQuestionBankSchema>;

export async function POST(req: Request) {
  let session: Awaited<ReturnType<typeof getAuthSession>> = null;
  try {
    session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const userId = session.user.id;

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
        { message: 'Question Bank is a Pro feature. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    const body = (await req.json()) as CreateQuestionBankPayload;
    const { subject, title, questions } = createQuestionBankSchema.parse(body);

    // Check question bank limit for Pro users
    if (user.plan === 'PRO') {
      const currentQuestionCount = await prisma.question.count({
        where: {
          questionBank: {
            userId: userId,
          },
        },
      });

      if (currentQuestionCount + questions.length > QUESTION_BANK_LIMITS.PRO) {
        return NextResponse.json(
          { message: `Question Bank limit exceeded. Pro plan allows up to ${QUESTION_BANK_LIMITS.PRO} questions.` },
          { status: 403 }
        );
      }
    }

    // Create question bank with questions
    const questionBank = await prisma.questionBank.create({
      data: {
        userId,
        subject,
        title,
        questions: {
          create: questions.map((q) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points,
            order: q.order,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    logger.info('Question bank created successfully', {
      questionBankId: questionBank.id,
      userId,
      questionCount: questions.length
    });

    return NextResponse.json(questionBank, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('Question bank creation validation failed', { issues: error.issues });
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    logger.error('Question bank creation error', error, { userId: session?.user?.id });
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  let session: Awaited<ReturnType<typeof getAuthSession>> = null;
  try {
    session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const userId = session.user.id;

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
        { message: 'Question Bank is a Pro feature. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');

    // Build where clause
    const whereClause: any = {
      userId,
    };

    if (subject) {
      whereClause.subject = subject;
    }

    // Fetch question banks
    const questionBanks = await prisma.questionBank.findMany({
      where: whereClause,
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(questionBanks, { status: 200 });
  } catch (error: unknown) {
    logger.error('Question bank fetch error', error, { userId: session?.user?.id });
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
