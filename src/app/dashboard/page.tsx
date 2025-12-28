import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { SubjectPerformance } from "@/components/dashboard/SubjectPerformance";
import { RecentExams } from "@/components/dashboard/RecentExams";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export default async function DashboardPage() {
  const session = (await getAuthSession()) as Session | null;
  // The layout already protects this page, but we need the session to fetch data
  if (!session || !session.user) {
    return null; // Or a more specific error component
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
        },
        orderBy: {
          completedAt: 'desc'
        },
        take: 1
      }
    }
  });

  const recentExams = exams.map((exam) => ({
    id: exam.id,
    subject: exam.subject,
    createdAt: exam.createdAt.toISOString(),
    questions: exam.questions,
    attempts: exam.attempts,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">
          Welcome back, <span className="gradient-text">{session.user.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-muted-foreground">
          Track your progress and keep the streak going!
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak Calendar */}
        <div className="lg:col-span-2">
          <StreakCalendar />
        </div>

        {/* Subject Performance */}
        <div className="lg:col-span-1">
          <SubjectPerformance />
        </div>
      </div>

      {/* Recent Exams */}
      <RecentExams exams={recentExams} />
      
      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
