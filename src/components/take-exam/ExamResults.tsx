"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sparkles,
  RotateCcw,
  LayoutDashboard,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface QuestionResult {
  id: string;
  text: string;
  type: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  points: number;
}

interface ExamResultsProps {
  examTitle: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  questionResults: QuestionResult[];
  aiFeedback: string; // New prop for AI feedback
  calculatedPercentile: number; // New prop for calculated percentile
}

const AnimatedScore = ({ score }: { score: number }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return <span>{displayScore}</span>;
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ExamResults = ({
  examTitle,
  subject,
  totalQuestions,
  correctAnswers,
  timeSpent,
  questionResults,
  aiFeedback, // Destructure new prop
  calculatedPercentile, // Destructure new prop
}: ExamResultsProps) => {
  const router = useRouter();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Use calculatedPercentile instead of mock
  const percentile = calculatedPercentile;

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { text: "Outstanding!", color: "text-green-500" };
    if (score >= 80) return { text: "Excellent Work!", color: "text-green-500" };
    if (score >= 70) return { text: "Good Job!", color: "text-yellow-500" };
    if (score >= 60) return { text: "Keep Practicing!", color: "text-orange-500" };
    return { text: "Room for Improvement", color: "text-red-500" };
  };

  const scoreMessage = getScoreMessage(score);

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Calculate strengths and weaknesses - now dynamic from AI feedback
  // These will be parsed from aiFeedback
  // const totalPoints = questionResults.reduce((sum, q) => sum + q.points, 0);
  // const earnedPoints = questionResults.filter(q => q.isCorrect).reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{examTitle}</h1>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
            {subject}
          </span>
        </div>

        {/* Score Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                className="fill-none stroke-muted/30"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                className={cn(
                  "fill-none transition-all duration-1000",
                  score >= 70 ? "stroke-green-500" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500"
                )}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 553} 553`}
                style={{ transition: "stroke-dasharray 1.5s ease-out" }}
              />
            </svg>
            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-foreground">
                <AnimatedScore score={score} />%
              </span>
              <span className={cn("text-sm font-medium", scoreMessage.color)}>
                {scoreMessage.text}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-2xl p-4 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {correctAnswers}/{totalQuestions}
            </div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-2xl p-4 text-center">
            <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {formatTime(timeSpent)}
            </div>
            <div className="text-xs text-muted-foreground">Time Spent</div>
          </div>
          <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-2xl p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{accuracy}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-2xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">Top {percentile}%</div>
            <div className="text-xs text-muted-foreground">Percentile</div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="backdrop-blur-xl bg-primary/10 border-2 border-primary/30 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-primary">AI Analysis</h2>
          </div>

          <div className="prose prose-base dark:prose-invert max-w-none leading-relaxed">
            {aiFeedback ? (
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
                {aiFeedback}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">No AI feedback available for this exam.</p>
            )}
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Question Breakdown</h2>
          <div className="space-y-3">
            {questionResults.map((question) => (
              <div
                key={question.id}
                className={cn(
                  "backdrop-blur-xl border rounded-2xl overflow-hidden transition-all",
                  question.isCorrect
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                )}
              >
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        question.isCorrect
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      )}
                    >
                      {question.isCorrect ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        Question {question.id}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {question.points} {question.points === 1 ? "pt" : "pts"}
                      </span>
                    </div>
                  </div>
                  {expandedQuestions.has(question.id) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedQuestions.has(question.id) && (
                  <div className="px-4 pb-4 border-t border-border/30 pt-4">
                    <p className="text-sm text-foreground mb-4">{question.text}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Your Answer</span>
                        <p
                          className={cn(
                            "text-sm font-medium mt-1",
                            question.isCorrect ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {question.userAnswer || "Not answered"}
                        </p>
                      </div>
                      {!question.isCorrect && (
                        <div>
                          <span className="text-xs text-muted-foreground">Correct Answer</span>
                          <p className="text-sm font-medium text-green-500 mt-1">
                            {question.correctAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <span className="text-xs text-muted-foreground">Explanation</span>
                      <p className="text-sm text-foreground mt-1">{question.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1 gap-2">
            <Eye className="w-4 h-4" />
            Review All Answers
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <RotateCcw className="w-4 h-4" />
            Retake Exam
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
