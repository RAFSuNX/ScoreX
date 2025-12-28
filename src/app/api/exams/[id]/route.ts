import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const examId = params.id;

    if (!examId) {
      return NextResponse.json({ message: 'Exam ID is required' }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    // For privacy, we should not return the correct answers to the client before the exam is submitted.
    // However, for the take-exam page, we need to show the questions.
    // We will strip the correct answers from the questions before sending them to the client.
    // Also map database field names to frontend expected names
    const questionsForStudent = exam.questions.map((q) => {
      const { questionText, questionType, options, id, points, order } = q;

      // Convert options object {A: "...", B: "...", C: "...", D: "..."} to array ["...", "...", "...", "..."]
      const optionsArray = options && typeof options === 'object' && !Array.isArray(options)
        ? Object.values(options)
        : options;

      return {
        id,
        points,
        order,
        text: questionText,
        type: questionType.toLowerCase().replace(/_/g, '-'), // Convert MULTIPLE_CHOICE to multiple-choice
        options: optionsArray,
      };
    });

    const examForStudent = { ...exam, questions: questionsForStudent };


    return NextResponse.json(examForStudent, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
