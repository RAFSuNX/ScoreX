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

    const userId = session.user.id;

    const totalExams = await prisma.exam.count({
      where: { userId },
    });

    const attempts = await prisma.examAttempt.findMany({
      where: { userId },
      select: { percentage: true, timeSpent: true },
    });

    const totalAttempts = attempts.length;
    const averageScore = totalAttempts > 0 ? attempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts : 0;
    const totalTimeSpent = attempts.reduce((acc, a) => acc + a.timeSpent, 0);

    const streak = await prisma.streak.findUnique({
        where: { userId },
        select: { currentStreak: true }
    });

    return NextResponse.json({
      totalExams,
      averageScore,
      currentStreak: streak?.currentStreak || 0,
      totalTimeSpent,
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
