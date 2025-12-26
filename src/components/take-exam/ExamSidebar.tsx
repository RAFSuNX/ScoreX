import { Clock, Flag, Send, Star, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExamSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  timeRemaining: number;
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onGoToQuestion: (questionNumber: number) => void;
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
  isOpen,
  onClose,
  timeRemaining,
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  flaggedQuestions,
  onGoToQuestion,
  onToggleFlag,
  isFlagged,
  onSubmit,
}: ExamSidebarProps) => {
  const isLowTime = timeRemaining < 300;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-80 backdrop-blur-xl bg-card/90 border-l border-border/50 z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Close Button (Mobile) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Timer */}
          <div
            className={cn(
              "text-center p-6 rounded-2xl mb-6",
              isLowTime
                ? "bg-destructive/20 border border-destructive/30"
                : "bg-muted/30 border border-border/50"
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
                "text-4xl font-mono font-bold",
                isLowTime ? "text-destructive animate-pulse" : "text-foreground"
              )}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Questions Overview */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Questions Overview
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
                (num) => {
                  const isAnswered = answeredQuestions.has(num);
                  const isFlaggedQ = flaggedQuestions.has(num);
                  const isCurrent = num === currentQuestion;

                  return (
                    <button
                      key={num}
                      onClick={() => {
                        onGoToQuestion(num);
                        onClose();
                      }}
                      className={cn(
                        "relative w-full aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary"
                          : isAnswered
                          ? "bg-green-500/20 text-green-500 border border-green-500/30"
                          : "bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted"
                      )}
                    >
                      {num}
                      {isFlaggedQ && (
                        <Star
                          className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500"
                          fill="currentColor"
                        />
                      )}
                    </button>
                  );
                }
              )}
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
              "w-full mb-3 gap-2",
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
      </div>
    </>
  );
};

export default ExamSidebar;
