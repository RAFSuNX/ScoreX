import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface StatsSummary {
  totalExams: number;
  averageScore: number;
  totalTimeSpent: number; // in seconds
}

async function getStatsForPeriod(userId: string, startDate: Date, endDate: Date): Promise<StatsSummary> {
  const exams = await prisma.exam.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { id: true }, // Only need ID to count
  });

  const attempts = await prisma.examAttempt.findMany({
    where: {
      userId,
      examId: {
        in: exams.map(e => e.id),
      },
      completedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { percentage: true, timeSpent: true },
  });

  const totalExams = exams.length;
  const totalAttempts = attempts.length;
  const averageScore = totalAttempts > 0 ? attempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts : 0;
  const totalTimeSpent = attempts.reduce((acc, a) => acc + a.timeSpent, 0); // Sum of timeSpent in seconds

  return { totalExams, averageScore, totalTimeSpent };
}

function calculateChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%'; // If previous was 0, any increase is 100% or no change
  }
  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  const sign = percentage > 0 ? '+' : '';
  return `${sign}${percentage.toFixed(0)}%`;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();

    // --- Date Ranges for Current Week/Month ---
    // Current Week (last 7 days including today)
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - 6);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Current Month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // --- Date Ranges for Previous Week/Month ---
    // Previous Week (7 days before currentWeekStart)
    const previousWeekEnd = new Date(currentWeekStart);
    previousWeekEnd.setDate(currentWeekStart.getDate() - 1);
    const previousWeekStart = new Date(previousWeekEnd);
    previousWeekStart.setDate(previousWeekEnd.getDate() - 6);
    previousWeekStart.setHours(0, 0, 0, 0);
    
    // Previous Month
    const previousMonthEnd = new Date(currentMonthStart);
    previousMonthEnd.setDate(currentMonthStart.getDate() - 1); // Last day of previous month
    const previousMonthStart = new Date(previousMonthEnd.getFullYear(), previousMonthEnd.getMonth(), 1);

    // --- Fetch Stats ---
    const allExams = await prisma.exam.findMany({
      where: { userId },
      select: { id: true, createdAt: true },
    });
    
    const allAttempts = await prisma.examAttempt.findMany({
      where: { userId },
      select: { percentage: true, timeSpent: true, completedAt: true },
    });

    // Helper to filter exams/attempts by date
    const filterByDate = (items: any[], startDate: Date, endDate: Date, dateField: string) => {
        return items.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= startDate && itemDate <= endDate;
        });
    };

    // Calculate overall stats for displaying absolute values
    const totalExams = allExams.length;
    const totalAttempts = allAttempts.length;
    const averageScore = totalAttempts > 0 ? allAttempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts : 0;
    const totalTimeSpent = allAttempts.reduce((acc, a) => acc + a.timeSpent, 0);

    // Stats for current week
    const currentWeekExams = filterByDate(allExams, currentWeekStart, now, 'createdAt').length;
    const currentWeekAttempts = filterByDate(allAttempts, currentWeekStart, now, 'completedAt');
    const currentWeekTimeSpent = currentWeekAttempts.reduce((acc, a) => acc + a.timeSpent, 0);

    // Stats for previous week
    const previousWeekExams = filterByDate(allExams, previousWeekStart, previousWeekEnd, 'createdAt').length;
    const previousWeekAttempts = filterByDate(allAttempts, previousWeekStart, previousWeekEnd, 'completedAt');
    const previousWeekTimeSpent = previousWeekAttempts.reduce((acc, a) => acc + a.timeSpent, 0);

    // Stats for current month
    const currentMonthAttempts = filterByDate(allAttempts, currentMonthStart, now, 'completedAt');
    const currentMonthAverageScore = currentMonthAttempts.length > 0 ? currentMonthAttempts.reduce((acc, a) => acc + a.percentage, 0) / currentMonthAttempts.length : 0;

    // Stats for previous month
    const previousMonthAttempts = filterByDate(allAttempts, previousMonthStart, previousMonthEnd, 'completedAt');
    const previousMonthAverageScore = previousMonthAttempts.length > 0 ? previousMonthAttempts.reduce((acc, a) => acc + a.percentage, 0) / previousMonthAttempts.length : 0;


    const streak = await prisma.streak.findUnique({
        where: { userId },
        select: { currentStreak: true, longestStreak: true }
    });

    return NextResponse.json({
      totalExams,
      averageScore,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      totalTimeSpent,
      // Changes
      totalExamsChange: calculateChange(currentWeekExams, previousWeekExams),
      averageScoreChange: calculateChange(currentMonthAverageScore, previousMonthAverageScore),
      totalTimeSpentChange: calculateChange(currentWeekTimeSpent, previousWeekTimeSpent),
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
