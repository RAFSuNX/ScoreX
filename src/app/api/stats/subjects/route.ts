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

    const attempts = await prisma.examAttempt.findMany({
      where: { userId: session.user.id },
      include: {
        exam: {
          select: {
            subject: true,
          },
        },
      },
    });

    const subjectStats: { [key: string]: { scores: number[], count: number } } = {};

    for (const attempt of attempts) {
      const subject = attempt.exam.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = { scores: [], count: 0 };
      }
      subjectStats[subject].scores.push(attempt.percentage || 0);
      subjectStats[subject].count++;
    }
    
    const subjectAverages = Object.entries(subjectStats).map(([subject, data]) => ({
      subject,
      averageScore: data.scores.reduce((a, b) => a + b, 0) / data.count,
    }));

    return NextResponse.json(subjectAverages, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
