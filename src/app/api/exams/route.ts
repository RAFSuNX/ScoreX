import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const exams = await prisma.exam.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        questions: {
          select: {
            id: true,
          },
        },
        attempts: {
          select: {
            id: true,
            score: true,
            percentage: true,
          }
        }
      }
    });

    return NextResponse.json(exams, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
