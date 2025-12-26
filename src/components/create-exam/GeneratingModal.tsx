import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface GeneratingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  "Reading content",
  "Analyzing key concepts",
  "Generating questions",
  "Review & finalize",
];

export const GeneratingModal = ({ isOpen, onComplete }: GeneratingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const intervals = [1500, 2000, 2500, 1500];
    let stepIndex = 0;

    const advanceStep = () => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
        setTimeout(advanceStep, intervals[stepIndex]);
      } else {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    };

    setTimeout(advanceStep, intervals[0]);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-lg" />

      {/* Modal */}
      <div className="relative morphic-card p-8 w-full max-w-md animate-scale-in">
        {/* Spinner */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-muted/30" />
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground text-center mb-2">
          AI is analyzing your content...
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-8">
          This may take a moment
        </p>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

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
