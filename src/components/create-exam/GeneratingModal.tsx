import { Check, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface GeneratingModalProps {
  isOpen: boolean;
  examId: string | null;
  onComplete: () => void;
  onError: (error: string) => void;
}

const stepLabels = [
  "Reading content",
  "Analyzing key concepts",
  "Generating questions",
  "Review & finalize",
];

export const GeneratingModal = ({ isOpen, examId, onComplete, onError }: GeneratingModalProps) => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !examId) {
      // Reset state when modal closes
      return () => {
        setCurrentStep(null);
        setError(null);
      };
    }

    const pollStatus = async () => {
      try {
        const response = await axios.get(`/api/ai/generate/status/${examId}`);
        const data = response.data;

        setCurrentStep(data.currentStep);

        if (data.status === 'COMPLETED') {
          clearInterval(pollingInterval);
          setTimeout(() => {
            onComplete();
          }, 1000);
        } else if (data.status === 'FAILED') {
          clearInterval(pollingInterval);
          const errorMessage = data.error || 'Generation failed. Please try again.';
          setError(errorMessage);
          setTimeout(() => {
            onError(errorMessage);
          }, 2000);
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Continue polling even on error - might be temporary network issue
      }
    };

    // Start polling immediately, then every 2 seconds
    pollStatus();
    const pollingInterval = setInterval(pollStatus, 2000);

    return () => {
      clearInterval(pollingInterval);
    };
  }, [isOpen, examId, onComplete, onError]);

  if (!isOpen) return null;

  const getCurrentStepIndex = () => {
    if (!currentStep) return -1;
    return stepLabels.indexOf(currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-lg" />

      {/* Modal */}
      <div className="relative morphic-card p-8 w-full max-w-md animate-scale-in">
        {/* Spinner or Error Icon */}
        <div className="flex justify-center mb-8">
          {error ? (
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-muted/30" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground text-center mb-2">
          {error ? 'Generation Failed' : 'AI is analyzing your content...'}
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {error ? error : 'This may take a moment'}
        </p>

        {/* Steps */}
        <div className="space-y-3">
          {stepLabels.map((step, index) => {
            const isCompleted = currentStepIndex > index;
            const isActive = currentStepIndex === index;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-primary/10 border border-primary/20"
                    : isCompleted
                    ? "bg-muted/30"
                    : "opacity-50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-foreground"
                      : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
