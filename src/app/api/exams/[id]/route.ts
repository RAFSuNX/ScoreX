import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
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
    const questionsForStudent = exam.questions.map(q => {
      const { correctAnswer, explanation, ...question } = q;
      return question;
    });

    const examForStudent = { ...exam, questions: questionsForStudent };


    return NextResponse.json(examForStudent, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
