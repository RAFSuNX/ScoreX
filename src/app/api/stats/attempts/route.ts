import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attempts = await prisma.examAttempt.findMany({
      where: { userId: session.user.id },
      orderBy: { completedAt: 'desc' },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            subject: true,
          },
        },
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Failed to fetch attempts:', error);
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
  }
}
