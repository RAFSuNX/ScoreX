import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import axios from 'axios';
import { AttemptStatus } from '@prisma/client'; // Import AttemptStatus enum

const submitExamSchema = z.object({
  answers: z.record(z.string(), z.string()).optional(), // questionId: userAnswer
  timeSpent: z.number().int().positive(),
  attemptId: z.string().optional(), // Optional: if resuming an existing attempt
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const examId = params.id;

    if (!examId) {
      return NextResponse.json({ message: 'Exam ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { answers, timeSpent, attemptId } = submitExamSchema.parse(body);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    let score = 0;
    const maxScore = exam.questions.reduce((acc, q) => acc + q.points, 0);
    const detailedReport = [];

    for (const question of exam.questions) {
      const userAnswer = answers?.[question.id];
      // Note: Comparing answers.
      // For short-answer, case-insensitive might be too lenient depending on requirements.
      // For multiple-choice/true-false, this is generally fine.
      const isCorrect = userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
      if (isCorrect) {
        score += question.points;
      }
      detailedReport.push({
        id: question.id,
        text: question.questionText,
        type: question.questionType,
        userAnswer: userAnswer || "No answer",
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        points: question.points,
      });
    }

    const percentage = (score / maxScore) * 100;

    // Simplified percentile calculation based on score
    let calculatedPercentile;
    if (percentage >= 90) calculatedPercentile = 5; // Top 5%
    else if (percentage >= 80) calculatedPercentile = 10; // Top 10%
    else if (percentage >= 70) calculatedPercentile = 20; // Top 20%
    else if (percentage >= 60) calculatedPercentile = 30; // Top 30%
    else if (percentage >= 50) calculatedPercentile = 50; // Top 50%
    else calculatedPercentile = 70; // Bottom 30% or more

    const feedbackPrompt = `A student has just completed an exam. Here is a summary of their performance:
- Score: ${score}/${maxScore} (${percentage.toFixed(2)}%)
- Time Spent: ${timeSpent} seconds
- Detailed Report:
${JSON.stringify(detailedReport, null, 2)}

Please provide personalized feedback for the student. The feedback should be encouraging and constructive. Highlight their strengths and weaknesses. Provide specific suggestions for improvement. The feedback should be in Markdown format.`;

    const feedbackResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.AI_MODEL_GRADING || 'openai/gpt-4-turbo-preview',
        messages: [{ role: 'user', content: feedbackPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      }
    );

    const aiFeedback = feedbackResponse.data.choices[0].message.content;

    let examAttempt;

    if (attemptId) {
        // Find and update existing IN_PROGRESS attempt
        examAttempt = await prisma.examAttempt.update({
            where: {
                id: attemptId,
                userId: userId, // Ensure user owns the attempt
                status: AttemptStatus.IN_PROGRESS,
            },
            data: {
                status: AttemptStatus.COMPLETED,
                submittedAnswers: answers, // Use submittedAnswers for final
                score,
                maxScore,
                percentage,
                timeSpent,
                aiFeedback,
                completedAt: new Date(),
                inProgressAnswers: null, // Clear in-progress data
                currentQuestionIndex: null,
                flaggedQuestions: null,
            },
        });
    } else {
        // Create new attempt (if not resuming or first submission)
        examAttempt = await prisma.examAttempt.create({
            data: {
                userId: session.user.id,
                examId,
                status: AttemptStatus.COMPLETED,
                submittedAnswers: answers,
                score,
                maxScore,
                percentage,
                timeSpent,
                aiFeedback,
                completedAt: new Date(),
            },
        });
    }

    return NextResponse.json({ ...examAttempt, detailedReport, calculatedPercentile }, { status: 200 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}


