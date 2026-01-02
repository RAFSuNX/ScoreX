import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { Plan } from '@prisma/client'; // Import Plan enum from Prisma Client

export const dynamic = "force-dynamic";

// Define monthly exam limits based on user plan
const MONTHLY_EXAM_LIMITS: Record<Plan, number> = {
  FREE: 5,
  PRO: 50, // Example: 50 exams per month for Pro users
  PREMIUM: 9999, // Effectively unlimited for Premium
};

const createExamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().optional(),
  sourceType: z.enum(['PDF', 'DESCRIPTION', 'QUESTION_BANK']), // Added QUESTION_BANK
  sourceText: z.string().optional(),
  sourcePdfUrl: z.string().optional(), // Added for PDF handling
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  subject: z.string().min(3, 'Subject must be at least 3 characters long'),
  aiModel: z.string().optional(),
  questionIds: z.array(z.string()).optional(), // For building exams from question bank
});

type CreateExamPayload = z.infer<typeof createExamSchema>;

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

    const limit = MONTHLY_EXAM_LIMITS[user.plan];
    if (limit === 9999) { // Unlimited plan
        // Do nothing, no quota check needed
    } else {
        // Calculate the start of the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count exams created by the user in the current month
        const currentMonthExamsCount = await prisma.exam.count({
            where: {
                userId: userId,
                createdAt: {
                    gte: startOfMonth,
                },
            },
        });

        if (currentMonthExamsCount >= limit) {
            return NextResponse.json(
                { message: `Monthly exam quota exceeded. You can create ${limit} exams per month on your ${user.plan} plan.` },
                { status: 403 }
            );
        }
    }

    const body = (await req.json()) as CreateExamPayload;
    const { title, description, sourceType, sourceText, sourcePdfUrl, difficulty, subject, aiModel, questionIds } = createExamSchema.parse(body);

    // Validation based on source type
    if (sourceType === 'QUESTION_BANK') {
      // For QUESTION_BANK: ensure questionIds are provided
      if (!questionIds || questionIds.length === 0) {
        return NextResponse.json({ message: 'Question IDs are required when building from question bank' }, { status: 400 });
      }

      // Check if user has access to Question Bank (Pro feature)
      if (user.plan === 'FREE') {
        return NextResponse.json(
          { message: 'Building exams from Question Bank is a Pro feature. Please upgrade your plan.' },
          { status: 403 }
        );
      }

      // Verify that all questions exist and belong to the user
      const questions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          questionBank: {
            userId: userId,
          },
        },
      });

      if (questions.length !== questionIds.length) {
        return NextResponse.json(
          { message: 'Some questions not found or do not belong to you' },
          { status: 404 }
        );
      }

      // Create exam with questions copied from the bank
      const exam = await prisma.exam.create({
        data: {
          title,
          description,
          sourceType,
          sourceText: `Exam created from Question Bank with ${questions.length} questions`,
          difficulty,
          subject,
          userId: session.user.id,
          aiModel: aiModel || 'question-bank',
          generationStatus: 'COMPLETED', // Mark as completed since questions are already provided
          questions: {
            create: questions.map((q, index) => ({
              questionText: q.questionText,
              questionType: q.questionType,
              options: q.options ?? undefined,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation ?? undefined,
              points: q.points,
              order: index,
            })),
          },
        },
        include: {
          questions: true,
        },
      });

      logger.info('Exam created from question bank', { examId: exam.id, userId: session.user.id, questionCount: questions.length });
      return NextResponse.json(exam, { status: 201 });
    } else {
      // For PDF and DESCRIPTION types
      if (!sourceText) {
        return NextResponse.json({ message: 'Source text is required (extracted from PDF or provided as description)' }, { status: 400 });
      }
      // For PDF type: ensure sourcePdfUrl is present
      if (sourceType === 'PDF' && !sourcePdfUrl) {
        return NextResponse.json({ message: 'Source PDF URL is required for PDF-based exams' }, { status: 400 });
      }

      const exam = await prisma.exam.create({
        data: {
          title,
          description,
          sourceType,
          sourceText: sourceText || null, // Store sourceText for both PDF (extracted text) and DESCRIPTION
          sourcePdfUrl: sourceType === 'PDF' ? sourcePdfUrl : null, // Conditionally save sourcePdfUrl
          difficulty,
          subject,
          userId: session.user.id,
          aiModel: aiModel || 'default-model',
        },
      });

      logger.info('Exam created successfully', { examId: exam.id, userId: session.user.id });
      return NextResponse.json(exam, { status: 201 });
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('Exam creation validation failed', { issues: error.issues });
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    logger.error('Exam creation error', error, { userId: session?.user?.id });
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
