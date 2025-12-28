import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get platform-wide statistics
    const [totalUsers, totalExams, totalQuestionsCount] = await Promise.all([
      // Count total users
      prisma.user.count(),

      // Count total exams
      prisma.exam.count(),

      // Count total questions across all exams
      prisma.exam.findMany({
        select: {
          questions: true,
        },
      }),
    ]);

    // Calculate total questions
    const totalQuestions = totalQuestionsCount.reduce((sum, exam) => {
      return sum + (exam.questions as any[]).length;
    }, 0);

    // Format numbers for display
    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return num.toString();
    };

    return NextResponse.json({
      totalUsers: formatNumber(totalUsers),
      totalExams: formatNumber(totalExams),
      totalQuestions: formatNumber(totalQuestions),
      rawTotalUsers: totalUsers,
      rawTotalExams: totalExams,
      rawTotalQuestions: totalQuestions,
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform statistics' },
      { status: 500 }
    );
  }
}
