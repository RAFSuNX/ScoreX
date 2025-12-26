import { Check } from "lucide-react";

interface ExamWizardProgressProps {
  currentStep: number;
  steps: string[];
}

export const ExamWizardProgress = ({ currentStep, steps }: ExamWizardProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                    ? "bg-primary/20 border-2 border-primary text-primary"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 transition-colors duration-300 ${
                  isCompleted ? "bg-primary" : "bg-muted/50"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
