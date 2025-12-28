import { Button } from "@/components/ui/button";
import { Sparkles, FileText, BookOpen, Timer, Cpu } from "lucide-react";

interface ExamData {
  sourceType: "pdf" | "topic";
  file?: File;
  topic?: string;
  title: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  questionTypes: string[];
}

interface StepPreviewGenerateProps {
  data: ExamData;
  onBack: () => void;
  onGenerate: () => void;
}

const difficultyLabels = {
  easy: { label: "Easy", class: "text-emerald-400" },
  medium: { label: "Medium", class: "text-amber-400" },
  hard: { label: "Hard", class: "text-rose-400" },
};

export const StepPreviewGenerate = ({
  data,
  onBack,
  onGenerate,
}: StepPreviewGenerateProps) => {
  const estimatedTime = Math.ceil(data.questionCount * 0.75);
  const remainingQuota = 4;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Review & Generate
        </h2>
        <p className="text-muted-foreground">
          Everything looks good? Let's create your exam!
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Summary Card */}
        <div className="morphic-card p-6 space-y-5">
          {/* Source */}
          <div className="flex items-start gap-4">
            <FileText className="h-6 w-6 text-primary flex-shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Source Material
              </p>
              {data.sourceType === "pdf" ? (
                <p className="text-foreground font-medium truncate">
                  {data.file?.name}
                </p>
              ) : (
                <p className="text-foreground font-medium line-clamp-2">
                  {data.topic}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Exam Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Subject
              </p>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">{data.subject}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Difficulty
              </p>
              <span className={`font-medium ${difficultyLabels[data.difficulty].class}`}>
                {difficultyLabels[data.difficulty].label}
              </span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Questions
              </p>
              <span className="text-foreground font-medium">{data.questionCount} questions</span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Types
              </p>
              <span className="text-foreground font-medium">
                {data.questionTypes.length} selected
              </span>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Estimated Time & AI Model */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Estimated time: <span className="text-foreground font-medium">~{estimatedTime} minutes</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">AI Powered</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8 text-center space-y-4">
          <Button
            variant="hero"
            size="lg"
            className="w-full sm:w-auto px-12 py-6 text-lg group"
            onClick={onGenerate}
          >
            <Sparkles className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            Generate Exam
          </Button>

          <p className="text-sm text-muted-foreground">
            This will use 1 exam from your monthly quota ({remainingQuota} remaining)
          </p>
        </div>
      </div>

      <div className="flex justify-start">
        <Button variant="glass" size="lg" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};
