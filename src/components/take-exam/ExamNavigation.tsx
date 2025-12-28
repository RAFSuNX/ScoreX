import { ChevronLeft, ChevronRight, LayoutGrid, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question } from "./QuestionCard";

interface ExamNavigationProps {
  currentQuestion: number; // Index of the current question
  totalQuestions: number;
  questions: Question[]; // Pass the actual questions to map IDs
  answeredQuestionIds: Set<string>;
  flaggedQuestionIds: Set<string>;
  onPrevious: () => void;
  onNext: () => void;
  onGoToQuestion: (questionIndex: number) => void;
  onSubmit: () => void;
  onOpenSidebar?: () => void;
}

const ExamNavigation = ({
  currentQuestion,
  totalQuestions,
  questions,
  answeredQuestionIds,
  flaggedQuestionIds,
  onPrevious,
  onNext,
  onGoToQuestion,
  onSubmit,
  onOpenSidebar,
}: ExamNavigationProps) => {
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const isFirstQuestion = currentQuestion === 0;

  return (
    <div className="sticky bottom-0 z-40 border-t border-border/60 bg-background/95 shadow-[0_-6px_20px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        {/* Previous + Review (mobile) */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstQuestion}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          {onOpenSidebar && (
            <Button
              variant="outline"
              onClick={onOpenSidebar}
              className="gap-2 lg:hidden"
            >
              <LayoutGrid className="w-4 h-4" />
              Review
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="min-w-max px-4">
            <div className="flex items-center justify-center gap-2">
              {questions.map((q, index) => {
                const isAnswered = answeredQuestionIds.has(String(q.id));
                const isFlagged = flaggedQuestionIds.has(String(q.id));
                const isCurrent = index === currentQuestion;

                return (
                  <button
                    key={q.id}
                    onClick={() => onGoToQuestion(index)}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors",
                      isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : isAnswered
                        ? "bg-green-500/20 text-green-500 border-green-500/30"
                        : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {index + 1}
                    {isFlagged && (
                      <Star
                        className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500"
                        fill="currentColor"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Next/Submit Button */}
        {isLastQuestion ? (
          <Button onClick={onSubmit} className="gap-2 bg-green-600 hover:bg-green-700">
            Submit Exam
          </Button>
        ) : (
          <Button onClick={onNext} className="gap-2">
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExamNavigation;
