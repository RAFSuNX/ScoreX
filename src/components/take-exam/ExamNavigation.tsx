import { ChevronLeft, ChevronRight, Flag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  [key: string]: any;
}

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
}: ExamNavigationProps) => {
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const isFirstQuestion = currentQuestion === 0;

  return (
    <div className="sticky bottom-0 z-50">
      <div className="backdrop-blur-xl bg-card/80 border-t border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isFirstQuestion}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Question Navigator */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center justify-center gap-2 min-w-max px-4">
                {questions.map((q, index) => {
                  const isAnswered = answeredQuestionIds.has(String(q.id));
                  const isFlagged = flaggedQuestionIds.has(String(q.id));
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={q.id}
                      onClick={() => onGoToQuestion(index)}
                      className={cn(
                        "relative w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center",
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : isAnswered
                          ? "bg-green-500/20 text-green-500 border border-green-500/30"
                          : "bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {index + 1}
                      {isFlagged && (
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
      </div>
    </div>
  );
};

export default ExamNavigation;
