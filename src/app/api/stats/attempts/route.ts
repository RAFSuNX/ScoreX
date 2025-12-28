import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAuthSession();

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
