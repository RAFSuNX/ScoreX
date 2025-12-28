import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { AttemptStatus, Prisma } from '@prisma/client';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get examId from query parameters if provided
    const url = new URL(req.url);
    const examId = url.searchParams.get('examId');

    const whereClause: Prisma.ExamAttemptWhereInput = {
      userId: userId,
      status: AttemptStatus.IN_PROGRESS,
    };

    // If examId is provided, filter by it
    if (examId) {
      whereClause.examId = examId;
    }

    const inProgressAttempt = await prisma.examAttempt.findFirst({
      where: whereClause,
      orderBy: {
        updatedAt: 'desc', // Get the most recently updated in-progress attempt
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    if (!inProgressAttempt) {
      return NextResponse.json({ message: 'No in-progress exam found' }, { status: 404 });
    }

    // Map timeSpent to currentTimeSpent for frontend compatibility
    const response = {
      ...inProgressAttempt,
      currentTimeSpent: inProgressAttempt.timeSpent,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: unknown) {
    console.error('Error fetching in-progress exam:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
