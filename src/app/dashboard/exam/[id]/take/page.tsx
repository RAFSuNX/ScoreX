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

type AnswerMap = Record<string, string | undefined>;

interface ExamData {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
}

interface InProgressAttempt {
  id: string;
  inProgressAnswers?: AnswerMap | null;
  currentQuestionIndex: number | null;
  currentTimeSpent: number | null;
  flaggedQuestions?: string[];
}

interface SubmissionQuestionReport {
  id: string;
  isCorrect: boolean;
  points: number;
  userAnswer?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  text?: string;
  type?: string;
}

interface SubmissionResult {
  timeSpent: number;
  detailedReport: SubmissionQuestionReport[];
  aiFeedback?: string;
  calculatedPercentile?: number;
}

export default function TakeExamPage({ params }: { params: { id: string } }) {
  const [exam, setExam] = useState<ExamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null); // New state for attempt ID
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // useRef to hold mutable values without triggering re-renders in intervals
  const answersRef = useRef<AnswerMap>(answers);
  const currentQuestionRef = useRef(currentQuestion);
  const timeRemainingRef = useRef(timeRemaining);
  const flaggedQuestionsRef = useRef(flaggedQuestions);
  const attemptIdRef = useRef<string | null>(attemptId);

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
        const examResponse = await axios.get<ExamData>(`/api/exams/${params.id}`);
        setExam(examResponse.data);

        // Fetch existing IN_PROGRESS attempt for this exam and user
        const attemptResponse = await axios.get<InProgressAttempt | null>(`/api/exams/in-progress?examId=${params.id}`);
        const existingAttempt = attemptResponse.data;

        if (existingAttempt) {
          setAttemptId(existingAttempt.id);
          if (existingAttempt.inProgressAnswers && Object.keys(existingAttempt.inProgressAnswers).length > 0) {
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
      } catch {
        // No in-progress attempt found or failed to fetch; start fresh
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
          const response = await axios.post<{ id: string }>(`/api/exams/${params.id}/save-progress`, {
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
  }, [exam, isSubmitted, isLoading, params.id]);


  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlag = () => {
    if (!exam) {
      return;
    }
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
      const response = await axios.post<SubmissionResult>(`/api/exams/${params.id}/submit`, {
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
  }, [exam, isSubmitted, handleSubmitExam]);


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

  const answeredQuestionIds = new Set(Object.keys(answers));

  if (isSubmitted && submissionResult) {
    const correctAnswers = submissionResult.detailedReport.filter((r) => r.isCorrect).length;
    const questionResults = submissionResult.detailedReport.map((result) => ({
      id: result.id,
      text: result.text || "",
      type: result.type || "",
      userAnswer: result.userAnswer ?? null,
      correctAnswer: result.correctAnswer || "",
      isCorrect: result.isCorrect,
      explanation: result.explanation || "",
      points: result.points,
    }));
    return (
      <ExamResults
        examTitle={exam.title}
        subject={exam.subject}
        totalQuestions={exam.questions.length}
        correctAnswers={correctAnswers}
        timeSpent={submissionResult.timeSpent}
        questionResults={questionResults}
        aiFeedback={submissionResult.aiFeedback || ""}
        calculatedPercentile={submissionResult.calculatedPercentile || 50}
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

      <div className="mx-auto max-w-6xl px-4 pt-24 pb-32 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex-1">
            <QuestionCard
              question={exam.questions[currentQuestion]}
              questionNumber={currentQuestion + 1}
              selectedAnswer={answers[exam.questions[currentQuestion].id] ?? null}
              onAnswerSelect={(answer) => handleAnswer(exam.questions[currentQuestion].id, answer)}
              isFlagged={flaggedQuestions.has(exam.questions[currentQuestion].id)}
              onToggleFlag={toggleFlag}
            />
          </div>

          <ExamSidebar
            variant="inline"
            questions={exam.questions}
            currentQuestion={currentQuestion}
            timeRemaining={timeRemaining}
            answeredQuestionIds={answeredQuestionIds}
            flaggedQuestionIds={flaggedQuestions}
            onGoToQuestion={setCurrentQuestion}
            onToggleFlag={toggleFlag}
            isFlagged={flaggedQuestions.has(exam.questions[currentQuestion].id)}
            onSubmit={() => setShowSubmitModal(true)}
          />
        </div>
      </div>

      <ExamNavigation
        questions={exam.questions}
        currentQuestion={currentQuestion}
        totalQuestions={exam.questions.length}
        answeredQuestionIds={answeredQuestionIds}
        flaggedQuestionIds={flaggedQuestions}
        onPrevious={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentQuestion((prev) => Math.min(exam.questions.length - 1, prev + 1))}
        onGoToQuestion={setCurrentQuestion}
        onSubmit={() => setShowSubmitModal(true)}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      <ExamSidebar
        questions={exam.questions}
        currentQuestion={currentQuestion}
        timeRemaining={timeRemaining}
        answeredQuestionIds={answeredQuestionIds}
        flaggedQuestionIds={flaggedQuestions}
        onGoToQuestion={setCurrentQuestion}
        onToggleFlag={toggleFlag}
        isFlagged={flaggedQuestions.has(exam.questions[currentQuestion].id)}
        onSubmit={() => setShowSubmitModal(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
