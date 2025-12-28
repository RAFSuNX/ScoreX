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

    const userStats = await prisma.userStats.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(userStats || {
      totalExams: 0,
      examsPassed: 0,
      examsFailed: 0,
      avgScore: 0,
      totalTimeSpent: 0,
      subjectStats: {},
    });
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
