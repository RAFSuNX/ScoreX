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
    <div className="sticky top-0 z-50">
      <div className="backdrop-blur-xl bg-card/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title and Subject */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                {title}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                {subject}
              </span>
            </div>

            {/* Center: Question Progress */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Question <span className="text-foreground font-semibold">{currentQuestion}</span> of{" "}
                <span className="text-foreground font-semibold">{totalQuestions}</span>
              </span>
            </div>

            {/* Right: Timer */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold transition-all",
                isLowTime
                  ? "bg-destructive/20 text-destructive border border-destructive/30 animate-pulse"
                  : "bg-muted/50 text-foreground border border-border/50"
              )}
            >
              {isLowTime ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5 text-muted-foreground" />
              )}
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted/30">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExamHeader;
