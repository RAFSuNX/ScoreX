"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FlashcardPlayer } from "@/components/flashcard/FlashcardPlayer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, ArrowLeft, Loader2 } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options?: any;
  correctAnswer: string;
  explanation?: string;
  points: number;
  order: number;
}

interface Exam {
  id: string;
  title: string;
  description?: string;
  subject: string;
  difficulty: string;
  questions: Question[];
}

export default function FlashcardStudyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const examId = params.id as string;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchExam();
    }
  }, [status, examId, router]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exams/${examId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch exam");
      }

      const data = await response.json();
      setExam(data);
    } catch (err) {
      console.error("Error fetching exam:", err);
      setError("Failed to load exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    router.push(`/dashboard/exam/${examId}/review`);
  };

  // Check if user has access to flashcard mode
  const isFreeUser = session?.user?.plan === "FREE";

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center space-y-4">
          <p className="text-destructive">{error || "Exam not found"}</p>
          <Button variant="outline" onClick={() => router.push("/dashboard/exams")}>
            Back to Exams
          </Button>
        </Card>
      </div>
    );
  }

  // Show upgrade prompt for FREE users
  if (isFreeUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/exam/${examId}/review`)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>

          <Card className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Flashcard Study Mode</h1>
              <p className="text-lg text-muted-foreground">
                A Pro Feature
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4 text-left">
              <p className="text-muted-foreground">
                Flashcard Mode helps you study more effectively by:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Interactive card flipping for active recall</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Track which questions you know vs. don't know</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Shuffle cards for randomized practice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Focus on explanations for deeper learning</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button
                variant="hero"
                size="lg"
                onClick={() => router.push("/billing/checkout?plan=PRO")}
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Pro - $19/month
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Join thousands of students improving their learning with Pro features
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // PRO/PREMIUM users can access the flashcard player
  return (
    <FlashcardPlayer
      questions={exam.questions}
      examTitle={exam.title}
      onExit={handleExit}
    />
  );
}
