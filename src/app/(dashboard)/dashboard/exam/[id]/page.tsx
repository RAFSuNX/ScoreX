"use client";

import { useState, useEffect, useCallback } from "react";
import ExamHeader from "@/components/take-exam/ExamHeader";
import QuestionCard, { Question } from "@/components/take-exam/QuestionCard";
import ExamNavigation from "@/components/take-exam/ExamNavigation";
import ExamSidebar from "@/components/take-exam/ExamSidebar";
import SubmitConfirmModal from "@/components/take-exam/SubmitConfirmModal";
import ExamResults from "@/components/take-exam/ExamResults";

// Mock exam data (will be replaced with API call)
const mockQuestions: Question[] = [
  {
    id: 1,
    type: "multiple-choice",
    text: "What is the primary purpose of the useState hook in React?",
    points: 2,
    options: [
      "To manage component state",
      "To handle side effects",
      "To create context",
      "To optimize performance",
    ],
  },
  {
    id: 2,
    type: "multiple-choice",
    text: "Which of the following is NOT a valid JavaScript data type?",
    points: 2,
    options: ["String", "Boolean", "Float", "Symbol"],
  },
  {
    id: 3,
    type: "true-false",
    text: "In React, props are read-only and cannot be modified by the child component.",
    points: 1,
  },
];

export default function TakeExamPage({ params }: { params: { id: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newFlags = new Set(prev);
      if (newFlags.has(currentQuestion)) {
        newFlags.delete(currentQuestion);
      } else {
        newFlags.add(currentQuestion);
      }
      return newFlags;
    });
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    setShowSubmitModal(false);
  };

  const unansweredCount = mockQuestions.filter((q) => !answers[q.id]).length;
  const flaggedCount = flaggedQuestions.size;

  if (isSubmitted) {
    return <ExamResults />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      <ExamHeader
        examTitle="React Fundamentals"
        subject="Programming"
        currentQuestion={currentQuestion + 1}
        totalQuestions={mockQuestions.length}
        timeRemaining={timeRemaining}
      />

      <div className="pt-24 pb-32 px-4 lg:px-8 flex">
        <div className="flex-1 max-w-4xl mx-auto">
          <QuestionCard
            question={mockQuestions[currentQuestion]}
            answer={answers[mockQuestions[currentQuestion].id]}
            onAnswer={(answer) => handleAnswer(mockQuestions[currentQuestion].id, answer)}
          />
        </div>

        <ExamSidebar
          questions={mockQuestions}
          currentQuestion={currentQuestion}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onQuestionClick={setCurrentQuestion}
          onToggleFlag={toggleFlag}
          onSubmit={() => setShowSubmitModal(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <ExamNavigation
        currentQuestion={currentQuestion}
        totalQuestions={mockQuestions.length}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        onPrevious={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentQuestion((prev) => Math.min(mockQuestions.length - 1, prev + 1))}
        onQuestionClick={setCurrentQuestion}
        onSubmit={() => setShowSubmitModal(true)}
      />

      <SubmitConfirmModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmitExam}
        unansweredCount={unansweredCount}
        flaggedCount={flaggedCount}
        totalQuestions={mockQuestions.length}
      />
    </div>
  );
}
