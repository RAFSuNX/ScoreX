import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Clock, FileText, TrendingUp, Play, Eye, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Session } from "next-auth";

export default async function ExamOverviewPage({ params }: { params: { id: string } }) {
  const session = (await getAuthSession()) as Session | null;

  if (!session || !session.user) {
    redirect("/login");
  }

  const exam = await prisma.exam.findUnique({
    where: {
      id: params.id,
    },
    include: {
      questions: {
        select: {
          id: true,
          points: true,
        },
      },
      attempts: {
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
        },
        orderBy: {
          completedAt: 'desc',
        },
        select: {
          id: true,
          score: true,
          maxScore: true,
          percentage: true,
          timeSpent: true,
          completedAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!exam) {
    return <div>Exam not found</div>;
  }

  if (exam.userId !== session.user.id) {
    return <div>Unauthorized</div>;
  }

  const completedAttempts = exam.attempts;
  const hasAttempts = completedAttempts.length > 0;

  // Calculate improvement
  let improvement: number | null = null;
  if (completedAttempts.length >= 2) {
    const latest = completedAttempts[0].percentage || 0;
    const previous = completedAttempts[1].percentage || 0;
    improvement = latest - previous;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'hard': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="morphic-card p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-black text-foreground">{exam.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(exam.difficulty)}`}>
                {exam.difficulty}
              </span>
            </div>

            <p className="text-muted-foreground mb-4">{exam.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {exam.questions.length} questions
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                {exam.subject}
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created {new Date(exam.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {hasAttempts && (
            <Link href={`/dashboard/exam/${exam.id}/review`}>
              <Button variant="default" size="lg">
                <Eye className="h-5 w-5 mr-2" />
                Review Attempts
              </Button>
            </Link>
          )}
          <Link href={`/dashboard/exam/${exam.id}/take`}>
            <Button variant={hasAttempts ? "outline" : "default"} size="lg">
              <Play className="h-5 w-5 mr-2" />
              {hasAttempts ? "Retake Exam" : "Start Exam"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {hasAttempts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Attempts</span>
            </div>
            <p className="text-3xl font-bold">{completedAttempts.length}</p>
          </div>

          <div className="stat-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Best Score</span>
            </div>
            <p className="text-3xl font-bold">
              {Math.max(...completedAttempts.map(a => a.percentage || 0)).toFixed(0)}%
            </p>
          </div>

          <div className="stat-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${improvement && improvement > 0 ? 'bg-green-500/10' : improvement && improvement < 0 ? 'bg-red-500/10' : 'bg-gray-500/10'}`}>
                <TrendingUp className={`h-5 w-5 ${improvement && improvement > 0 ? 'text-green-500' : improvement && improvement < 0 ? 'text-red-500' : 'text-gray-500'}`} />
              </div>
              <span className="text-sm text-muted-foreground">Improvement</span>
            </div>
            <p className={`text-3xl font-bold ${improvement && improvement > 0 ? 'text-green-500' : improvement && improvement < 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {improvement !== null ? `${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Recent Attempts */}
      {hasAttempts && (
        <div className="morphic-card p-6">
          <h2 className="text-xl font-bold mb-4">Recent Attempts</h2>
          <div className="space-y-3">
            {completedAttempts.slice(0, 5).map((attempt, index) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">#{completedAttempts.length - index}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Attempt {completedAttempts.length - index}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${(attempt.percentage || 0) >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {attempt.percentage?.toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {attempt.score}/{attempt.maxScore} points
                    </p>
                  </div>
                  {attempt.timeSpent && (
                    <div className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {formatTime(attempt.timeSpent)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* First Time Taking */}
      {!hasAttempts && (
        <div className="morphic-card p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t taken this exam yet. Click the button below to start your first attempt.
            </p>
            <Link href={`/dashboard/exam/${exam.id}/take`}>
              <Button size="lg">
                <Play className="h-5 w-5 mr-2" />
                Start Your First Attempt
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
