import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileText, Clock, TrendingUp, Play, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Session } from "next-auth";

export default async function MyExamsPage() {
  const session = (await getAuthSession()) as Session | null;

  if (!session || !session.user) {
    return null;
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
          maxScore: true,
          percentage: true,
          completedAt: true,
        },
        orderBy: {
          completedAt: 'desc'
        },
      }
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'hard': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">
          My <span className="gradient-text">Exams</span>
        </h1>
        <p className="text-muted-foreground">
          View and manage all your created exams
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Exams</span>
          </div>
          <p className="text-3xl font-bold">{exams.length}</p>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <p className="text-3xl font-bold">
            {exams.filter(e => e.attempts.length > 0).length}
          </p>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <span className="text-sm text-muted-foreground">Pending</span>
          </div>
          <p className="text-3xl font-bold">
            {exams.filter(e => e.attempts.length === 0).length}
          </p>
        </div>
      </div>

      {/* Exams List */}
      {exams.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-bold mb-2">No exams yet</h3>
          <p className="text-muted-foreground mb-6">Create your first AI-generated exam to get started</p>
          <Link href="/dashboard/create">
            <Button>Create New Exam</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {exams.map((exam) => {
            const latestAttempt = exam.attempts[0];
            const hasAttempt = exam.attempts.length > 0;

            return (
              <div key={exam.id} className="morphic-card p-6 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{exam.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(exam.difficulty)}`}>
                        {exam.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {exam.questions.length} questions
                      </span>
                      <span>•</span>
                      <span>{exam.subject}</span>
                      <span>•</span>
                      <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                    </div>

                    {hasAttempt && latestAttempt && latestAttempt.percentage !== null && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">Latest Score:</span>
                        <span className={`font-bold ${latestAttempt.percentage >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                          {latestAttempt.percentage.toFixed(0)}%
                        </span>
                        <span className="text-muted-foreground">
                          ({latestAttempt.score}/{latestAttempt.maxScore} points)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/exam/${exam.id}`}>
                      <Button variant={hasAttempt ? "outline" : "default"}>
                        {hasAttempt ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start Exam
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
