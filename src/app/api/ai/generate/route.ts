import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import axios from 'axios';
import { Prisma } from '@prisma/client';

export const dynamic = "force-dynamic";

const generateQuestionsSchema = z.object({
  examId: z.string(),
});

type GenerateQuestionsBody = z.infer<typeof generateQuestionsSchema>;

interface GeneratedQuestionPayload {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options: Record<string, string> | null;
  correctAnswer: string;
  explanation: string;
}

interface OpenRouterChoice {
  message: {
    content: string;
  };
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

// Background processing function
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

    const prompt = `Based on the following text, generate 10 questions in a JSON object format with a "questions" key, which contains an array of questions. Each question should be an object with the following fields: "questionText" (string), "questionType" (enum: "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"), "options" (object with keys A, B, C, D for MULTIPLE_CHOICE, null otherwise), "correctAnswer" (string, the key for MULTIPLE_CHOICE), and "explanation" (string).

Text: """
${exam.sourceText}
"""`;

    // Update status: Generating questions
    await prisma.exam.update({
      where: { id: examId },
      data: { currentStep: 'Generating questions' },
    });

    const response = await axios.post<OpenRouterResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: env.AI_MODEL_GENERATION,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        },
      }
    );

    const aiResponse = response.data.choices[0]?.message.content ?? '{"questions": []}';
    const generatedQuestions = JSON.parse(aiResponse).questions as GeneratedQuestionPayload[];

    // Update status: Review & finalize
    await prisma.exam.update({
      where: { id: examId },
      data: { currentStep: 'Review & finalize' },
    });

    const createdQuestions = await prisma.$transaction(
      generatedQuestions.map((q, index) => {
        const optionsValue =
          q.options === null ? undefined : (q.options as Prisma.JsonObject | undefined);

        return prisma.question.create({
          data: {
            examId: exam.id,
            questionText: q.questionText,
            questionType: q.questionType,
            options: optionsValue,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: 1,
            order: index + 1,
          },
        });
      })
    );

    // Mark as completed
    await prisma.exam.update({
      where: { id: examId },
      data: {
        generationStatus: 'COMPLETED',
        currentStep: null,
      },
    });

    logger.info('Exam generation completed successfully', { examId, questionCount: createdQuestions.length });
  } catch (error: unknown) {
    logger.error('Background exam generation error', error, { examId });
    await prisma.exam.update({
      where: { id: examId },
      data: {
        generationStatus: 'FAILED',
        generationError: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    });
  }
}

export async function POST(req: Request) {
  let body: GenerateQuestionsBody | null = null;
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    body = await req.json();
    const { examId } = generateQuestionsSchema.parse(body);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    if (!exam.sourceText) {
      return NextResponse.json({ message: 'Exam source text not found' }, { status: 404 });
    }

    // Verify ownership
    if (exam.userId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Start background processing (don't await it)
    processExamGeneration(examId).catch((error) => {
      logger.error('Failed to start background processing', error, { examId });
    });

    // Return immediately with job started status
    return NextResponse.json(
      {
        examId,
        status: 'PROCESSING',
        message: 'Exam generation started',
      },
      { status: 202 }
    );

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('AI generation validation failed', { issues: error.issues });
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    logger.error('AI generation error', error, { examId: body?.examId });
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
