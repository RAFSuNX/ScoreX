import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamHeaderProps {
  title: string;
  subject: string;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number; // in seconds
  answeredCount: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ExamHeader = ({
  title,
  subject,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  answeredCount,
}: ExamHeaderProps) => {
  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-background/95 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Left: Title and Subject */}
        <div className="flex items-center gap-3">
          <h1 className="hidden text-lg font-semibold text-foreground sm:block">
            {title}
          </h1>
          <span className="rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
            {subject}
          </span>
        </div>

        {/* Center: Question Progress */}
        <div className="flex-1 text-center">
          <span className="text-sm text-muted-foreground">
            Question <span className="text-foreground font-semibold">{currentQuestion}</span> of{" "}
            <span className="text-foreground font-semibold">{totalQuestions}</span>
          </span>
        </div>

        {/* Right: Timer */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-lg font-semibold shadow-sm transition-colors",
            isLowTime
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border/60 bg-muted/30 text-foreground"
          )}
        >
          {isLowTime ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Clock className="h-5 w-5 text-muted-foreground" />
          )}
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-muted/30">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ExamHeader;
