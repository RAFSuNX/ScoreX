import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { AttemptStatus, Prisma, ExamAttempt, QuestionType } from '@prisma/client';

export const dynamic = "force-dynamic";

const submitExamSchema = z.object({
  answers: z.record(z.string(), z.string()).optional(), // questionId: userAnswer
  timeSpent: z.number().int().positive(),
  attemptId: z.string().optional(), // Optional: if resuming an existing attempt
});

type SubmitExamPayload = z.infer<typeof submitExamSchema>;

interface DetailedReportItem {
  id: string;
  text: string;
  type: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
  points: number;
}

type SubjectStatsRecord = Record<string, { count: number; totalScore: number; avgScore: number }>;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const examId = params.id;

    if (!examId) {
      return NextResponse.json({ message: 'Exam ID is required' }, { status: 400 });
    }

    const body = (await req.json()) as SubmitExamPayload;
    const { answers, timeSpent, attemptId } = submitExamSchema.parse(body);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    let score = 0;
    const maxScore = exam.questions.reduce((acc, q) => acc + q.points, 0);
    const detailedReport: DetailedReportItem[] = [];

    for (const question of exam.questions) {
      const userAnswer = answers?.[question.id];
      // Note: Comparing answers.
      // For short-answer, case-insensitive might be too lenient depending on requirements.
      // For multiple-choice/true-false, this is generally fine.
      const isCorrect = Boolean(
        userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase(),
      );
      if (isCorrect) {
        score += question.points;
      }
      detailedReport.push({
        id: question.id,
        text: question.questionText,
        type: question.questionType,
        userAnswer: userAnswer || "No answer",
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        points: question.points,
      });
    }

    const percentage = (score / maxScore) * 100;

    // Simplified percentile calculation based on score
    let calculatedPercentile;
    if (percentage >= 90) calculatedPercentile = 5; // Top 5%
    else if (percentage >= 80) calculatedPercentile = 10; // Top 10%
    else if (percentage >= 70) calculatedPercentile = 20; // Top 20%
    else if (percentage >= 60) calculatedPercentile = 30; // Top 30%
    else if (percentage >= 50) calculatedPercentile = 50; // Top 50%
    else calculatedPercentile = 70; // Bottom 30% or more

    // Generate AI feedback using centralized service
    const { aiService } = await import('@/lib/ai/service');

    const aiFeedback = await aiService.generateFeedback({
      examTitle: exam.title,
      questions: detailedReport.map((item) => ({
        questionText: item.text,
        questionType: item.type as QuestionType,
        correctAnswer: item.correctAnswer,
        userAnswer: item.userAnswer,
        options: null, // Can be extended if needed
      })),
      score,
      maxScore,
      percentage,
    });

    let examAttempt: ExamAttempt;

    if (attemptId) {
        // Find and update existing IN_PROGRESS attempt
        examAttempt = await prisma.examAttempt.update({
            where: {
                id: attemptId,
                userId: session.user.id, // Ensure user owns the attempt
                status: AttemptStatus.IN_PROGRESS,
            },
            data: {
                status: AttemptStatus.COMPLETED,
                submittedAnswers: answers, // Use submittedAnswers for final
                score,
                maxScore,
                percentage,
                timeSpent,
                aiFeedback,
                completedAt: new Date(),
                inProgressAnswers: Prisma.JsonNull, // Clear in-progress data
                currentQuestionIndex: null,
                flaggedQuestions: Prisma.JsonNull,
            },
        });
    } else {
        // Create new attempt (if not resuming or first submission)
        examAttempt = await prisma.examAttempt.create({
            data: {
                userId: session.user.id,
                examId,
                status: AttemptStatus.COMPLETED,
                submittedAnswers: answers,
                score,
                maxScore,
                percentage,
                timeSpent,
                aiFeedback,
                completedAt: new Date(),
            },
        });
    }

    // Update UserStats
    const isPassed = percentage >= 70; // Passing threshold
    const userStats = await prisma.userStats.findUnique({
      where: { userId: session.user.id },
    });

    if (userStats) {
      // Calculate new average score
      const newTotalExams = userStats.totalExams + 1;
      const newAvgScore = ((userStats.avgScore * userStats.totalExams) + percentage) / newTotalExams;

      // Get subject stats
      const subjectStats = (userStats.subjectStats as SubjectStatsRecord | null) || {};
      const subjectKey = exam.subject;
      if (!subjectStats[subjectKey]) {
        subjectStats[subjectKey] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      subjectStats[subjectKey].count += 1;
      subjectStats[subjectKey].totalScore += percentage;
      subjectStats[subjectKey].avgScore = subjectStats[subjectKey].totalScore / subjectStats[subjectKey].count;

      await prisma.userStats.update({
        where: { userId: session.user.id },
        data: {
          totalExams: newTotalExams,
          examsPassed: isPassed ? userStats.examsPassed + 1 : userStats.examsPassed,
          examsFailed: !isPassed ? userStats.examsFailed + 1 : userStats.examsFailed,
          avgScore: newAvgScore,
          totalTimeSpent: userStats.totalTimeSpent + timeSpent,
          subjectStats: subjectStats,
        },
      });
    } else {
      // Create new user stats
      const subjectStats: SubjectStatsRecord = {
        [exam.subject]: {
          count: 1,
          totalScore: percentage,
          avgScore: percentage,
        },
      };

      await prisma.userStats.create({
        data: {
          userId: session.user.id,
          totalExams: 1,
          examsPassed: isPassed ? 1 : 0,
          examsFailed: !isPassed ? 1 : 0,
          avgScore: percentage,
          totalTimeSpent: timeSpent,
          subjectStats: subjectStats,
        },
      });
    }

    // Update Streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.streak.findUnique({
      where: { userId: session.user.id },
    });

    if (streak) {
      const lastActiveDate = new Date(streak.lastActiveDate);
      lastActiveDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));

      let newCurrentStreak = streak.currentStreak;
      if (daysDiff === 0) {
        // Same day, no change to streak
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newCurrentStreak = streak.currentStreak + 1;
      } else {
        // Streak broken, reset to 1
        newCurrentStreak = 1;
      }

      const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);

      await prisma.streak.update({
        where: { userId: session.user.id },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastActiveDate: today,
          totalExams: streak.totalExams + 1,
          totalQuestions: streak.totalQuestions + exam.questions.length,
        },
      });
    } else {
      // Create new streak
      await prisma.streak.create({
        data: {
          userId: session.user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
          totalExams: 1,
          totalQuestions: exam.questions.length,
        },
      });
    }

    // Check for new badges and achievements
    try {
      const { checkAndUnlockBadges } = await import('@/lib/gamification/badges');
      const { updateAchievementProgress } = await import('@/lib/gamification/achievements');

      const newBadges = await checkAndUnlockBadges(session.user.id);
      const newAchievements = await updateAchievementProgress(session.user.id);

      return NextResponse.json({
        ...examAttempt,
        detailedReport,
        calculatedPercentile,
        gamification: {
          newBadges,
          newAchievements,
        }
      }, { status: 200 });
    } catch (gamificationError) {
      console.error('Gamification check failed:', gamificationError);
      // Return response even if gamification fails
      return NextResponse.json({ ...examAttempt, detailedReport, calculatedPercentile }, { status: 200 });
    }

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
