"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { ExamWizardProgress } from "@/components/create-exam/ExamWizardProgress";
import { StepSourceSelection } from "@/components/create-exam/StepSourceSelection";
import { StepExamConfig } from "@/components/create-exam/StepExamConfig";
import { StepPreviewGenerate } from "@/components/create-exam/StepPreviewGenerate";
import { GeneratingModal } from "@/components/create-exam/GeneratingModal";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [examData, setExamData] = useState<Partial<ExamData>>({});

  const handleSourceNext = (data: { sourceType: "pdf" | "topic"; file?: File; topic?: string }) => {
    setExamData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleConfigNext = (config: Omit<ExamData, "sourceType" | "file" | "topic">) => {
    setExamData((prev) => ({ ...prev, ...config }));
    setCurrentStep(3);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[60%] h-[60%]"
          style={{
            background: "radial-gradient(ellipse at top right, hsl(252 100% 69% / 0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[40%] h-[40%]"
          style={{
            background: "radial-gradient(ellipse at bottom left, hsl(252 60% 50% / 0.05) 0%, transparent 60%)",
          }}
        />
      </div>

      <DashboardSidebar />
      <MobileNav />

      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-8 px-4 lg:px-8 pb-12">
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
        </div>
      </main>

      <GeneratingModal isOpen={isGenerating} onComplete={handleGenerationComplete} />
    </div>
  );
}
