"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ExamWizardProgress } from "@/components/create-exam/ExamWizardProgress";
import { StepSourceSelection } from "@/components/create-exam/StepSourceSelection";
import { StepExamConfig } from "@/components/create-exam/StepExamConfig";
import { StepPreviewGenerate } from "@/components/create-exam/StepPreviewGenerate";
import { GeneratingModal } from "@/components/create-exam/GeneratingModal";
import { useToast } from "@/hooks/use-toast";

const steps = ["Source", "Configure", "Generate"];

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

export default function CreateExamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [examData, setExamData] = useState<Partial<ExamData>>({});
  const [examId, setExamId] = useState<string | null>(null);

  const handleSourceNext = (data: { sourceType: "pdf" | "topic"; file?: File; topic?: string }) => {
    setExamData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleConfigNext = (config: Omit<ExamData, "sourceType" | "file" | "topic">) => {
    setExamData((prev) => ({ ...prev, ...config }));
    setCurrentStep(3);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // 1. Create the exam record
      const createResponse = await axios.post('/api/exams/create', {
        title: examData.title,
        description: `An exam about ${examData.topic || 'a PDF file'}.`,
        sourceType: examData.sourceType === 'pdf' ? 'PDF' : 'DESCRIPTION',
        sourceText: examData.topic, // Assuming topic for now, PDF upload needs more work
        difficulty: examData.difficulty?.toUpperCase(),
        subject: examData.subject,
        aiModel: 'default-model', // Can be made dynamic later
      });

      const newExamId = createResponse.data.id;
      setExamId(newExamId);

      // 2. Trigger AI generation and wait for it to complete
      await axios.post('/api/ai/generate', {
        examId: newExamId,
      });

      // 3. Now that generation is complete, trigger the modal's onComplete handler
      handleGenerationComplete(newExamId);

    } catch (error: any) {
      console.error("Failed to generate exam", error);
      const errorMessage = error.response?.data?.message || "Failed to generate exam. Please try again.";
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: errorMessage,
      });
      setIsGenerating(false);
    }
  };

  const handleGenerationComplete = (id: string) => {
    setIsGenerating(false);
    // Navigate to the newly created exam page
    router.push(`/dashboard/exam/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">
          Create New <span className="gradient-text">Exam</span>
        </h1>
        <p className="text-muted-foreground">
          Let AI generate a personalized exam for you
        </p>
      </div>

      <ExamWizardProgress currentStep={currentStep} steps={steps} />

      <div className="morphic-card p-6 sm:p-8">
        {currentStep === 1 && <StepSourceSelection onNext={handleSourceNext} />}
        {currentStep === 2 && (
          <StepExamConfig
            onNext={handleConfigNext}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && examData.sourceType && examData.title && (
          <StepPreviewGenerate
            data={examData as ExamData}
            onBack={() => setCurrentStep(2)}
            onGenerate={handleGenerate}
          />
        )}
      </div>
      <GeneratingModal isOpen={isGenerating} onComplete={() => handleGenerationComplete(examId!)} />
    </div>
  );
}
