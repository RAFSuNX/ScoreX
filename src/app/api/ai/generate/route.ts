import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { aiService } from '@/lib/ai/service';
import { QuestionType } from '@prisma/client';
import { rateLimiters, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const generateQuestionsSchema = z.object({
  examId: z.string(),
});

type GenerateQuestionsBody = z.infer<typeof generateQuestionsSchema>;

// Background processing function using centralized AI service
async function processExamGeneration(examId: string) {
  try {
    // Update status: Reading content
    await prisma.exam.update({
      where: { id: examId },
      data: {
        generationStatus: 'PROCESSING',
        currentStep: 'Reading content',
      },
    });

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || !exam.sourceText) {
      await prisma.exam.update({
        where: { id: examId },
        data: {
          generationStatus: 'FAILED',
          generationError: 'Exam or source text not found',
        },
      });
      return;
    }

    // Update status: Analyzing key concepts
    await prisma.exam.update({
      where: { id: examId },
      data: { currentStep: 'Analyzing key concepts' },
    });

    // Optional: Analyze content to get suggestions
    // const analysis = await aiService.analyzeContent(exam.sourceText);

    // Update status: Generating questions
    await prisma.exam.update({
      where: { id: examId },
      data: { currentStep: 'Generating questions' },
    });

    // Use centralized AI service for question generation
    const result = await aiService.generateExam({
      sourceText: exam.sourceText,
      title: exam.title,
      subject: exam.subject,
      difficulty: exam.difficulty,
      questionCount: 10,
      questionTypes: [
        QuestionType.MULTIPLE_CHOICE,
        QuestionType.TRUE_FALSE,
        QuestionType.SHORT_ANSWER,
      ],
    });

    if (!result.questions || result.questions.length === 0) {
      throw new Error('No questions were generated');
    }

    // Update status: Finalizing
    await prisma.exam.update({
      where: { id: examId },
      data: { currentStep: 'Finalizing exam' },
    });

    // Save questions to database
    await prisma.question.createMany({
      data: result.questions.map((q, idx) => ({
        examId: exam.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options:
          q.options && q.questionType === 'MULTIPLE_CHOICE'
            ? { A: q.options[0], B: q.options[1], C: q.options[2], D: q.options[3] }
            : undefined,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points || 1,
        order: idx + 1,
      })),
    });

    // Mark exam as completed
    await prisma.exam.update({
      where: { id: examId },
      data: {
        generationStatus: 'COMPLETED',
        currentStep: 'Complete',
        generationError: null,
      },
    });

    logger.info('Exam generation completed successfully', {
      examId,
      questionsGenerated: result.questions.length,
    });
  } catch (error: unknown) {
    logger.error('Exam generation failed', error, { examId });

    await prisma.exam.update({
      where: { id: examId },
      data: {
        generationStatus: 'FAILED',
        generationError:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred during generation',
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const rateLimit = await rateLimiters.aiGeneration.check(10, getClientIp(req));
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.resetTime);
    }

    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateQuestionsBody = await req.json();
    const validationResult = generateQuestionsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid request body', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { examId } = validationResult.data;

    // Verify exam exists and belongs to user
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    if (exam.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (exam.generationStatus === 'PROCESSING') {
      return NextResponse.json(
        { message: 'Exam generation already in progress' },
        { status: 409 }
      );
    }

    if (exam.generationStatus === 'COMPLETED') {
      return NextResponse.json(
        { message: 'Exam has already been generated' },
        { status: 409 }
      );
    }

    // Start background generation
    processExamGeneration(examId).catch((error) => {
      logger.error('Background exam generation error', error, { examId });
    });

    return NextResponse.json(
      {
        message: 'Exam generation started',
        examId,
        status: 'PROCESSING',
      },
      { status: 202 }
    );
  } catch (error: unknown) {
    logger.error('Error starting exam generation', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
