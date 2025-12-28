import { Clock, Flag, Send, Star, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Question } from "./QuestionCard";

interface ExamSidebarProps {
  variant?: "overlay" | "inline";
  isOpen?: boolean;
  onClose?: () => void;
  timeRemaining: number;
  currentQuestion: number;
  questions: Question[]; // Pass the actual questions to map IDs
  answeredQuestionIds: Set<string>;
  flaggedQuestionIds: Set<string>;
  onGoToQuestion: (questionIndex: number) => void;
  onToggleFlag: () => void;
  isFlagged: boolean;
  onSubmit: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ExamSidebar = ({
  variant = "overlay",
  isOpen = false,
  onClose = () => {},
  timeRemaining,
  currentQuestion,
  questions,
  answeredQuestionIds,
  flaggedQuestionIds,
  onGoToQuestion,
  onToggleFlag,
  isFlagged,
  onSubmit,
}: ExamSidebarProps) => {
  const isLowTime = timeRemaining < 300;
  const isInline = variant === "inline";

  const content = (
    <div className={cn("relative flex flex-col p-6", isInline ? "gap-0" : "h-full")}>
      {/* Close Button (Mobile) */}
      {!isInline && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Timer */}
      <div
        className={cn(
          "text-center p-6 rounded-2xl mb-6 border",
          isLowTime
            ? "bg-destructive/15 border-destructive/30"
            : "bg-muted/30 border-border/50"
        )}
      >
        {isLowTime && (
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-destructive" />
        )}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className={cn("w-5 h-5", isLowTime ? "text-destructive" : "text-muted-foreground")} />
          <span className="text-sm text-muted-foreground">Time Remaining</span>
        </div>
        <span
          className={cn(
            "text-4xl font-mono font-bold tracking-wide",
            isLowTime ? "text-destructive" : "text-foreground"
          )}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Questions Overview */}
      <div className={cn("flex-1", isInline ? "overflow-visible" : "overflow-y-auto")}>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Questions Overview
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, index) => {
            const isAnswered = answeredQuestionIds.has(String(q.id));
            const isFlaggedQ = flaggedQuestionIds.has(String(q.id));
            const isCurrent = index === currentQuestion;

            return (
              <button
                key={q.id}
                onClick={() => {
                  onGoToQuestion(index);
                  if (!isInline) {
                    onClose();
                  }
                }}
                className={cn(
                  "relative w-full aspect-square rounded-lg text-sm font-medium transition-colors flex items-center justify-center border",
                  isCurrent
                    ? "bg-primary text-primary-foreground border-primary"
                    : isAnswered
                    ? "bg-green-500/20 text-green-500 border-green-500/30"
                    : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                )}
              >
                {index + 1}
                {isFlaggedQ && (
                  <Star
                    className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500"
                    fill="currentColor"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground my-4">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
          Answered
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-muted/50 border border-border/50" />
          Unanswered
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
          Flagged
        </div>
      </div>

      {/* Flag Toggle */}
      <Button
        variant="outline"
        onClick={onToggleFlag}
        className={cn(
          "w-full mb-3 gap-2 transition-colors",
          isFlagged && "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
        )}
      >
        <Flag className="w-4 h-4" fill={isFlagged ? "currentColor" : "none"} />
        {isFlagged ? "Remove Flag" : "Flag for Review"}
      </Button>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        className="w-full gap-2 bg-orange-600 hover:bg-orange-700"
      >
        <Send className="w-4 h-4" />
        Submit Exam
      </Button>
    </div>
  );

  if (isInline) {
    return (
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <div className="rounded-3xl border border-border/50 bg-card shadow-xl">
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 h-full w-80 bg-card border-l border-border/50 z-50 shadow-2xl transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {content}
      </div>
    </>
  );
};

export default ExamSidebar;
