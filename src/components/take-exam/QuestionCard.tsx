import { Check, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuestionType = "multiple-choice" | "true-false" | "short-answer";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  options?: string[];
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
}

const QuestionCard = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
  isFlagged,
  onToggleFlag,
}: QuestionCardProps) => {
  const optionLabels = ["A", "B", "C", "D"];

  const getTypeBadge = (type: QuestionType) => {
    switch (type) {
      case "multiple-choice":
        return "Multiple Choice";
      case "true-false":
        return "True / False";
      case "short-answer":
        return "Short Answer";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-3xl p-8 shadow-2xl">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Question {questionNumber}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/30">
              {getTypeBadge(question.type)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {question.points} {question.points === 1 ? "point" : "points"}
            </span>
            <button
              onClick={onToggleFlag}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isFlagged
                  ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              )}
            >
              <Flag className="w-4 h-4" fill={isFlagged ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Question Text */}
        <p className="text-xl text-foreground leading-relaxed mb-8">
          {question.text}
        </p>

        {/* Answer Options */}
        {question.type === "multiple-choice" && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onAnswerSelect(option)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors text-left",
                  selectedAnswer === option
                    ? "bg-primary/20 border-primary/50 text-foreground shadow-lg shadow-primary/10"
                    : "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50 hover:border-border"
                )}
              >
                <span
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors",
                    selectedAnswer === option
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {selectedAnswer === option ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    optionLabels[index]
                  )}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            ))}
          </div>
        )}

        {question.type === "true-false" && (
          <div className="grid grid-cols-2 gap-4">
            {["True", "False"].map((option) => (
              <button
                key={option}
                onClick={() => onAnswerSelect(option)}
                className={cn(
                  "p-6 rounded-2xl border text-center font-semibold text-lg transition-colors",
                  selectedAnswer === option
                    ? "bg-primary/20 border-primary/50 text-foreground shadow-lg shadow-primary/10"
                    : "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50 hover:border-border"
                )}
              >
                {selectedAnswer === option && (
                  <Check className="w-5 h-5 mx-auto mb-2" />
                )}
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === "short-answer" && (
          <div className="space-y-2">
            <textarea
              value={selectedAnswer || ""}
              onChange={(e) => onAnswerSelect(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-40 p-4 rounded-2xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{(selectedAnswer || "").length}/500 characters</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
