import { AlertTriangle, CheckCircle, Flag, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewUnanswered: () => void;
  onSubmitAnyway: () => void;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
}

const SubmitConfirmModal = ({
  isOpen,
  onClose,
  onReviewUnanswered,
  onSubmitAnyway,
  totalQuestions,
  answeredCount,
  flaggedCount,
}: SubmitConfirmModalProps) => {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;
  const hasWarnings = unansweredCount > 0 || flaggedCount > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md backdrop-blur-xl bg-card/90 border border-border/50 rounded-3xl p-8 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              hasWarnings
                ? "bg-orange-500/20 text-orange-500"
                : "bg-green-500/20 text-green-500"
            }`}
          >
            {hasWarnings ? (
              <AlertTriangle className="w-8 h-8" />
            ) : (
              <CheckCircle className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          {hasWarnings ? "Are you sure?" : "Ready to Submit?"}
        </h2>

        {/* Warning Message */}
        {unansweredCount > 0 && (
          <p className="text-center text-orange-500 mb-4">
            You have {unansweredCount} unanswered{" "}
            {unansweredCount === 1 ? "question" : "questions"}
          </p>
        )}

        {/* Summary */}
        <div className="bg-muted/30 rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Answered
            </div>
            <span className="font-semibold text-foreground">{answeredCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              Unanswered
            </div>
            <span className="font-semibold text-foreground">{unansweredCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flag className="w-4 h-4 text-yellow-500" />
              Flagged
            </div>
            <span className="font-semibold text-foreground">{flaggedCount}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {unansweredCount > 0 && (
            <Button
              variant="outline"
              onClick={onReviewUnanswered}
              className="w-full"
            >
              Review Unanswered
            </Button>
          )}
          <Button
            onClick={onSubmitAnyway}
            className={`w-full ${
              hasWarnings
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {hasWarnings ? "Submit Anyway" : "Submit Exam"}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Continue Exam
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmModal;
