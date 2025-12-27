import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AttemptStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const inProgressAttempt = await prisma.examAttempt.findFirst({
      where: {
        userId: userId,
        status: AttemptStatus.IN_PROGRESS,
      },
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

    return NextResponse.json(inProgressAttempt, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching in-progress exam:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
