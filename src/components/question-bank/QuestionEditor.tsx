"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Trash2 } from "lucide-react";
import { QuestionType } from "@prisma/client";

interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options?: any;
  correctAnswer: string;
  explanation?: string;
  points: number;
  order: number;
}

interface QuestionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onSave: (questionId: string, updates: Partial<Question>) => Promise<void>;
  onDelete?: (questionId: string) => Promise<void>;
}

const QuestionEditor = ({
  isOpen,
  onClose,
  question,
  onSave,
  onDelete,
}: QuestionEditorProps) => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("MULTIPLE_CHOICE");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load question data when modal opens
  useEffect(() => {
    if (question) {
      setQuestionText(question.questionText);
      setQuestionType(question.questionType);
      setCorrectAnswer(question.correctAnswer);
      setExplanation(question.explanation || "");
      setPoints(question.points);

      // Parse options for multiple choice
      if (question.questionType === "MULTIPLE_CHOICE" && question.options) {
        const opts = Array.isArray(question.options)
          ? question.options
          : JSON.parse(question.options as any);
        setOptions(opts.length === 4 ? opts : ["", "", "", ""]);
      } else if (question.questionType === "TRUE_FALSE") {
        setOptions(["True", "False"]);
      }
    }
  }, [question]);

  if (!isOpen || !question) return null;

  const handleSave = async () => {
    if (!questionText.trim() || !correctAnswer.trim()) {
      alert("Question text and correct answer are required");
      return;
    }

    setSaving(true);
    try {
      const updates: Partial<Question> = {
        questionText,
        questionType,
        correctAnswer,
        explanation: explanation || undefined,
        points,
      };

      // Add options for multiple choice and true/false
      if (questionType === "MULTIPLE_CHOICE") {
        const validOptions = options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          alert("Multiple choice questions need at least 2 options");
          return;
        }
        updates.options = validOptions;
      } else if (questionType === "TRUE_FALSE") {
        updates.options = ["True", "False"];
      }

      await onSave(question.id, updates);
      onClose();
    } catch (error) {
      console.error("Failed to save question:", error);
      alert("Failed to save question. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm("Are you sure you want to delete this question?")) return;

    setDeleting(true);
    try {
      await onDelete(question.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete question:", error);
      alert("Failed to delete question. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-card/90 border border-border/50 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Edit Question</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Question Type */}
          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type</Label>
            <Select value={questionType} onValueChange={(value) => setQuestionType(value as QuestionType)}>
              <SelectTrigger id="questionType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                <SelectItem value="FILL_IN_THE_BLANK">Fill in the Blank</SelectItem>
                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text</Label>
            <Textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question..."
              className="min-h-[100px]"
            />
          </div>

          {/* Options (for Multiple Choice and True/False) */}
          {questionType === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              <Label>Answer Options</Label>
              {options.map((option, index) => (
                <Input
                  key={index}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label htmlFor="correctAnswer">Correct Answer</Label>
            {questionType === "TRUE_FALSE" ? (
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger id="correctAnswer">
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="True">True</SelectItem>
                  <SelectItem value="False">False</SelectItem>
                </SelectContent>
              </Select>
            ) : questionType === "MULTIPLE_CHOICE" ? (
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger id="correctAnswer">
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {options.filter(opt => opt.trim()).map((opt, idx) => (
                    <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="correctAnswer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter correct answer..."
              />
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation (Optional)</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why this is the correct answer..."
              className="min-h-[80px]"
            />
          </div>

          {/* Points */}
          <div className="space-y-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          {onDelete && (
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            className="flex-shrink-0"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
