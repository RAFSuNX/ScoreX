"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ExamHeader from "@/components/take-exam/ExamHeader";
import QuestionCard, { Question } from "@/components/take-exam/QuestionCard";
import ExamNavigation from "@/components/take-exam/ExamNavigation";
import ExamSidebar from "@/components/take-exam/ExamSidebar";
import SubmitConfirmModal from "@/components/take-exam/SubmitConfirmModal";
import ExamResults from "@/components/take-exam/ExamResults";
import axios from "axios";

const EXAM_DURATION = 30 * 60; // 30 minutes in seconds
const SAVE_INTERVAL = 10 * 1000; // Save every 10 seconds

export default function TakeExamPage({ params }: { params: { id: string } }) {
  const [exam, setExam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null); // New state for attempt ID
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // useRef to hold mutable values without triggering re-renders in intervals
  const answersRef = useRef(answers);
  const currentQuestionRef = useRef(currentQuestion);
  const timeRemainingRef = useRef(timeRemaining);
  const flaggedQuestionsRef = useRef(flaggedQuestions);
  const attemptIdRef = useRef(attemptId);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);
  useEffect(() => {
    flaggedQuestionsRef.current = flaggedQuestions;
  }, [flaggedQuestions]);
  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);


  // --- Data Fetching and State Initialization ---
  useEffect(() => {
    const fetchExamAndAttempt = async () => {
      try {
        // Fetch Exam details
        const examResponse = await axios.get(`/api/exams/${params.id}`);
        setExam(examResponse.data);

        // Fetch existing IN_PROGRESS attempt for this exam and user
        const attemptResponse = await axios.get(`/api/exams/in-progress?examId=${params.id}`);
        const existingAttempt = attemptResponse.data;

        if (existingAttempt) {
          setAttemptId(existingAttempt.id);
          if (existingAttempt.inProgressAnswers) {
            setAnswers(existingAttempt.inProgressAnswers);
          }
          if (existingAttempt.currentQuestionIndex !== null) {
            setCurrentQuestion(existingAttempt.currentQuestionIndex);
          }
          if (existingAttempt.currentTimeSpent !== null) {
            setTimeRemaining(EXAM_DURATION - existingAttempt.currentTimeSpent);
          }
          if (existingAttempt.flaggedQuestions) {
            setFlaggedQuestions(new Set(existingAttempt.flaggedQuestions));
          }
        }
      } catch (error) {
        // console.error("No in-progress attempt found or failed to fetch:", error);
        // If no in-progress attempt found, start fresh
      } finally {
        setIsLoading(false);
      }
    };
    fetchExamAndAttempt();
  }, [params.id]);

  // --- Periodic Save ---
  useEffect(() => {
    if (!exam || isSubmitted || isLoading) return; // Don't save if no exam, submitted, or still loading

    const saveProgress = async () => {
      // Only save if attemptId exists or if we are about to create one
      if (attemptIdRef.current || (exam && !attemptIdRef.current && Object.keys(answersRef.current).length > 0)) {
        try {
          const response = await axios.post(`/api/exams/${params.id}/save-progress`, {
            attemptId: attemptIdRef.current, // Pass attemptId if already created
            inProgressAnswers: answersRef.current,
            currentTimeSpent: EXAM_DURATION - timeRemainingRef.current,
            currentQuestionIndex: currentQuestionRef.current,
            flaggedQuestions: Array.from(flaggedQuestionsRef.current),
          });
          if (!attemptIdRef.current && response.data.id) {
            setAttemptId(response.data.id); // Set attemptId if it was just created by the save-progress API
          }
        } catch (error) {
          console.error("Failed to save progress", error);
        }
      }
    };

    const interval = setInterval(saveProgress, SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [exam, isSubmitted, isLoading]);


  // --- Timer ---
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
  }, [exam, isSubmitted, handleSubmitExam]); // Add handleSubmitExam to dependency array

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

  const handleSubmitExam = useCallback(async () => {
    if (!exam) return;
    try {
      const response = await axios.post(`/api/exams/${params.id}/submit`, {
        answers: answersRef.current, // Use ref for latest answers
        timeSpent: EXAM_DURATION - timeRemainingRef.current, // Use ref for latest time
        attemptId: attemptIdRef.current, // Pass attemptId for update
      });
      setSubmissionResult(response.data);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit exam", error);
    } finally {
      setShowSubmitModal(false);
    }
  }, [exam, params.id]); // Dependencies for useCallback


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
          timeRemaining={timeRemaining}
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
        flaggedCount={flaggedQuestions.size}
        totalQuestions={exam.questions.length}
      />
    </div>
  );
}