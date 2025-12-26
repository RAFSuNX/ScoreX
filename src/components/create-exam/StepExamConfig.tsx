import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";

const subjects = [
  "Mathematics",
  "Science",
  "History",
  "Programming",
  "Languages",
  "Other",
];

const questionTypes = [
  { id: "multiple-choice", label: "Multiple Choice" },
  { id: "true-false", label: "True/False" },
  { id: "short-answer", label: "Short Answer" },
];

interface ExamConfig {
  title: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  questionTypes: string[];
}

interface StepExamConfigProps {
  onNext: (config: ExamConfig) => void;
  onBack: () => void;
}

export const StepExamConfig = ({ onNext, onBack }: StepExamConfigProps) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionCount, setQuestionCount] = useState(15);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["multiple-choice"]);

  const toggleQuestionType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  };

  const canProceed = title.trim() && subject && selectedTypes.length > 0;

  const handleNext = () => {
    onNext({
      title,
      subject,
      difficulty,
      questionCount,
      questionTypes: selectedTypes,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Customize Your Exam
        </h2>
        <p className="text-muted-foreground">
          Configure how your exam should be generated
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Exam Title */}
        <div className="morphic-card p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Exam Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Algebra Fundamentals Quiz"
            className="w-full p-3 bg-muted/30 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Subject Dropdown */}
        <div className="morphic-card p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Subject
          </label>
          <div className="relative">
            <button
              onClick={() => setSubjectOpen(!subjectOpen)}
              className="w-full p-3 bg-muted/30 border border-border/50 rounded-xl text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <span className={subject ? "text-foreground" : "text-muted-foreground"}>
                {subject || "Select a subject"}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${subjectOpen ? "rotate-180" : ""}`} />
            </button>
            {subjectOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl overflow-hidden z-20 shadow-lg">
                {subjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSubject(s);
                      setSubjectOpen(false);
                    }}
                    className="w-full p-3 text-left text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Difficulty */}
        <div className="morphic-card p-4">
          <label className="block text-sm font-medium text-foreground mb-3">
            Difficulty Level
          </label>
          <div className="flex gap-2">
            {[
              { id: "easy", label: "Easy", desc: "Basic concepts", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
              { id: "medium", label: "Medium", desc: "Standard level", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
              { id: "hard", label: "Hard", desc: "Advanced topics", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id as "easy" | "medium" | "hard")}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  difficulty === d.id
                    ? d.color
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="block font-medium text-sm">{d.label}</span>
                <span className="block text-xs opacity-70">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Question Count Slider */}
        <div className="morphic-card p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground">
              Number of Questions
            </label>
            <span className="text-2xl font-bold text-primary">{questionCount}</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full h-2 bg-muted/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>5 min</span>
            <span>30 max</span>
          </div>
        </div>

        {/* Question Types */}
        <div className="morphic-card p-4">
          <label className="block text-sm font-medium text-foreground mb-3">
            Question Types
          </label>
          <div className="space-y-2">
            {questionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => toggleQuestionType(type.id)}
                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  selectedTypes.includes(type.id)
                    ? "bg-primary/10 border-primary/30 text-foreground"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center ${
                    selectedTypes.includes(type.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50"
                  }`}
                >
                  {selectedTypes.includes(type.id) && <Check className="h-3 w-3" />}
                </div>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="glass" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="hero"
          size="lg"
          disabled={!canProceed}
          onClick={handleNext}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};
