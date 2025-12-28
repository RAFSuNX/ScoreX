import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAuthSession();

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
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
