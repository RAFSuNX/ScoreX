"use client";

import { useState, useEffect, useCallback } from "react";
import ExamHeader from "@/components/take-exam/ExamHeader";
import QuestionCard, { Question } from "@/components/take-exam/QuestionCard";
import ExamNavigation from "@/components/take-exam/ExamNavigation";
import ExamSidebar from "@/components/take-exam/ExamSidebar";
import SubmitConfirmModal from "@/components/take-exam/SubmitConfirmModal";
import ExamResults from "@/components/take-exam/ExamResults";
import axios from "axios";

export default function TakeExamPage({ params }: { params: { id: string } }) {
  const [exam, setExam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/exams/${params.id}`);
        setExam(response.data);
      } catch (error) {
        console.error("Failed to fetch exam", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [params.id]);

  // Timer
  useEffect(() => {
    if (!exam || isSubmitted) return;

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
  }, [exam, isSubmitted]);

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newFlags = new Set(prev);
      const questionId = exam.questions[currentQuestion].id;
      if (newFlags.has(questionId)) {
        newFlags.delete(questionId);
      } else {
        newFlags.add(questionId);
      }
      return newFlags;
    });
  };

  const handleSubmitExam = async () => {
    if (!exam) return;
    try {
      const response = await axios.post(`/api/exams/${params.id}/submit`, {
        answers,
        timeSpent: 30 * 60 - timeRemaining,
      });
      setSubmissionResult(response.data);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit exam", error);
    } finally {
      setShowSubmitModal(false);
    }
  };

  const goToFirstUnansweredQuestion = () => {
    if (!exam) return;
    const firstUnansweredIndex = exam.questions.findIndex(
      (q: Question) => !answers[q.id]
    );
    if (firstUnansweredIndex !== -1) {
      setCurrentQuestion(firstUnansweredIndex);
      setShowSubmitModal(false); // Close modal after navigating
    } else {
      // All questions answered, maybe show a message or just submit
      setShowSubmitModal(false);
      handleSubmitExam();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!exam) {
    return <div>Failed to load exam.</div>;
  }

  const unansweredCount = exam.questions.filter((q: Question) => !answers[q.id]).length;
  const flaggedCount = flaggedQuestions.size;

  if (isSubmitted && submissionResult) {
    const correctAnswers = submissionResult.detailedReport.filter((r: any) => r.isCorrect).length;
    return (
      <ExamResults
        examTitle={exam.title}
        subject={exam.subject}
        totalQuestions={exam.questions.length}
        correctAnswers={correctAnswers}
        timeSpent={submissionResult.timeSpent}
        questionResults={submissionResult.detailedReport}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <ExamHeader
        title={exam.title}
        subject={exam.subject}
        currentQuestion={currentQuestion + 1}
        totalQuestions={exam.questions.length}
        timeRemaining={timeRemaining}
        answeredCount={Object.keys(answers).length}
      />

      <div className="pt-24 pb-32 px-4 lg:px-8 flex">
        <div className="flex-1 max-w-4xl mx-auto">
          <QuestionCard
            question={exam.questions[currentQuestion]}
            selectedAnswer={answers[exam.questions[currentQuestion].id]}
            onAnswerSelect={(answer) => handleAnswer(exam.questions[currentQuestion].id, answer)}
            isFlagged={flaggedQuestions.has(exam.questions[currentQuestion].id)}
            onToggleFlag={toggleFlag}
          />
        </div>

        <ExamSidebar
          questions={exam.questions}
          currentQuestion={currentQuestion}
          totalQuestions={exam.questions.length}
          timeRemaining={timeRemaining} // Added missing prop
          answeredQuestionIds={new Set(Object.keys(answers))}
          flaggedQuestionIds={flaggedQuestions}
          onGoToQuestion={setCurrentQuestion}
          onToggleFlag={toggleFlag}
          isFlagged={flaggedQuestions.has(exam.questions[currentQuestion].id)}
          onSubmit={() => setShowSubmitModal(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <ExamNavigation
        questions={exam.questions}
        currentQuestion={currentQuestion}
        totalQuestions={exam.questions.length}
        answeredQuestionIds={new Set(Object.keys(answers))}
        flaggedQuestionIds={flaggedQuestions}
        onPrevious={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentQuestion((prev) => Math.min(exam.questions.length - 1, prev + 1))}
        onGoToQuestion={setCurrentQuestion}
        onSubmit={() => setShowSubmitModal(true)}
      />

      <SubmitConfirmModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onReviewUnanswered={goToFirstUnansweredQuestion}
        onSubmitAnyway={handleSubmitExam}
        answeredCount={Object.keys(answers).length}
        flaggedCount={flaggedCount}
        totalQuestions={exam.questions.length}
      />
    </div>
  );
}
