import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Calendar, CheckCircle, XCircle, AlertCircle, Brain, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Session } from "next-auth";
import ReactMarkdown from "react-markdown";
import { ShareButton } from "@/components/exam/ShareButton";
import { DownloadPDFButton } from "@/components/exam/DownloadPDFButton";

export default async function ExamReviewPage({ params }: { params: { id: string } }) {
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
          questionText: true,
          questionType: true,
          options: true,
          correctAnswer: true,
          explanation: true,
          points: true,
          order: true,
        },
        orderBy: {
          order: 'asc',
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
      },
    },
  });

  if (!exam) {
    return <div>Exam not found</div>;
  }

  if (exam.userId !== session.user.id) {
    return <div>Unauthorized</div>;
  }

  const attempts = exam.attempts;

  if (attempts.length === 0) {
    redirect(`/dashboard/exam/${params.id}/overview`);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getAnswerText = (questionId: string, answerId: string) => {
    const question = exam.questions.find(q => q.id === questionId);
    if (!question) return answerId;

    if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
      const options = question.options as Record<string, string>;
      return options[answerId] || answerId;
    }

    return answerId;
  };

  const getAttemptQuestionResult = (attempt: typeof attempts[0], questionId: string) => {
    if (!attempt.submittedAnswers) return null;

    const answers = attempt.submittedAnswers as Record<string, string>;
    const userAnswer = answers[questionId];
    const question = exam.questions.find(q => q.id === questionId);

    if (!question) return null;

    const isCorrect = userAnswer === question.correctAnswer;

    return {
      userAnswer,
      isCorrect,
      question,
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/exam/${exam.id}/overview`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
        </Link>
      </div>

      <div className="morphic-card p-8">
        <h1 className="text-3xl font-black text-foreground mb-2">{exam.title} - Review</h1>
        <p className="text-muted-foreground">
          Review your performance across all {attempts.length} attempt{attempts.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Performance Chart / Timeline */}
      <div className="morphic-card p-6">
        <h2 className="text-xl font-bold mb-4">Performance Over Time</h2>
        <div className="space-y-4">
          {attempts.map((attempt, index) => {
            const attemptNumber = attempts.length - index;
            const previousAttempt = index < attempts.length - 1 ? attempts[index + 1] : null;
            const improvement = previousAttempt
              ? (attempt.percentage || 0) - (previousAttempt.percentage || 0)
              : null;

            return (
              <div key={attempt.id} className="relative">
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                      (attempt.percentage || 0) >= 70
                        ? 'bg-green-500/20 text-green-500 border-2 border-green-500'
                        : (attempt.percentage || 0) >= 50
                        ? 'bg-yellow-500/20 text-yellow-500 border-2 border-yellow-500'
                        : 'bg-red-500/20 text-red-500 border-2 border-red-500'
                    }`}>
                      #{attemptNumber}
                    </div>
                    {index < attempts.length - 1 && (
                      <div className="w-0.5 h-full bg-border/50 mt-2" style={{ minHeight: '40px' }} />
                    )}
                  </div>

                  {/* Attempt Details */}
                  <div className="flex-1 pb-8">
                    <div className="morphic-card p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold mb-1">Attempt {attemptNumber}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-4xl font-bold ${
                            (attempt.percentage || 0) >= 70 ? 'text-green-500' :
                            (attempt.percentage || 0) >= 50 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {attempt.percentage?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {attempt.score}/{attempt.maxScore} points
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            Time
                          </div>
                          <div className="text-lg font-bold">
                            {attempt.timeSpent ? formatTime(attempt.timeSpent) : 'N/A'}
                          </div>
                        </div>

                        {improvement !== null && (
                          <div className="p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              {improvement >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              Improvement
                            </div>
                            <div className={`text-lg font-bold ${
                              improvement >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                            </div>
                          </div>
                        )}

                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <CheckCircle className="h-4 w-4" />
                            Correct
                          </div>
                          <div className="text-lg font-bold text-green-500">
                            {attempt.submittedAnswers ?
                              Object.keys(attempt.submittedAnswers as object).filter(qId => {
                                const result = getAttemptQuestionResult(attempt, qId);
                                return result?.isCorrect;
                              }).length : 0
                            }
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <XCircle className="h-4 w-4" />
                            Incorrect
                          </div>
                          <div className="text-lg font-bold text-red-500">
                            {attempt.submittedAnswers ?
                              Object.keys(attempt.submittedAnswers as object).filter(qId => {
                                const result = getAttemptQuestionResult(attempt, qId);
                                return result && !result.isCorrect;
                              }).length : 0
                            }
                          </div>
                        </div>
                      </div>

                      {/* AI Feedback */}
                      {attempt.aiFeedback && (
                        <div className="p-6 rounded-lg bg-primary/10 border-2 border-primary/30">
                          <div className="flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-lg font-bold mb-4 text-primary">AI Feedback</h4>
                              <div className="prose prose-base prose-invert max-w-none leading-relaxed">
                                <ReactMarkdown
                                  components={{
                                    p: ({node, ...props}) => <p className="mb-4 text-foreground leading-relaxed" {...props} />,
                                    ul: ({node, ...props}) => <ul className="mb-4 space-y-2 text-foreground" {...props} />,
                                    ol: ({node, ...props}) => <ol className="mb-4 space-y-2 text-foreground" {...props} />,
                                    li: ({node, ...props}) => <li className="ml-4 text-foreground" {...props} />,
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6 text-foreground" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5 text-foreground" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                                    code: ({node, ...props}) => <code className="bg-muted px-2 py-1 rounded text-sm" {...props} />,
                                  }}
                                >
                                  {attempt.aiFeedback}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Question-by-Question Breakdown */}
                      <details className="mt-4">
                        <summary className="cursor-pointer font-semibold text-sm hover:text-primary transition-colors">
                          View Question-by-Question Breakdown
                        </summary>
                        <div className="mt-4 space-y-3">
                          {exam.questions.map((question, qIndex) => {
                            const result = getAttemptQuestionResult(attempt, question.id);
                            if (!result) return null;

                            return (
                              <div
                                key={question.id}
                                className={`p-4 rounded-lg border-2 ${
                                  result.isCorrect
                                    ? 'bg-green-500/5 border-green-500/20'
                                    : 'bg-red-500/5 border-red-500/20'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {result.isCorrect ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500 mt-1" />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-semibold mb-2">
                                      Question {qIndex + 1}: {question.questionText}
                                    </h4>
                                    <div className="text-sm space-y-1">
                                      <p>
                                        <span className="text-muted-foreground">Your answer:</span>{' '}
                                        <span className={result.isCorrect ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                                          {result.userAnswer ? getAnswerText(question.id, result.userAnswer) : 'Not answered'}
                                        </span>
                                      </p>
                                      {!result.isCorrect && (
                                        <p>
                                          <span className="text-muted-foreground">Correct answer:</span>{' '}
                                          <span className="text-green-500 font-medium">
                                            {getAnswerText(question.id, question.correctAnswer)}
                                          </span>
                                        </p>
                                      )}
                                      {question.explanation && (
                                        <div className="mt-2 text-muted-foreground prose prose-sm prose-invert max-w-none">
                                          <ReactMarkdown>{question.explanation}</ReactMarkdown>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
        <ShareButton examId={exam.id} examTitle={exam.title} />
        <DownloadPDFButton examId={exam.id} />
        <Link href={`/dashboard/exam/${exam.id}/study`}>
          <Button size="lg" variant="outline" className="relative group">
            <Brain className="w-5 h-5 mr-2" />
            Study with Flashcards
            {session.user.plan === "FREE" && (
              <Crown className="w-4 h-4 ml-2 text-primary" />
            )}
          </Button>
        </Link>
        <Link href={`/dashboard/exam/${exam.id}/take`}>
          <Button size="lg">
            Retake Exam
          </Button>
        </Link>
      </div>
    </div>
  );
}
