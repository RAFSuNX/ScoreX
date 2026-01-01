import { prisma } from '@/lib/prisma';
import { AchievementCategory } from '@prisma/client';
import { logger } from '@/lib/logger';

// Define all achievements
export const ACHIEVEMENT_DEFINITIONS = [
  // Learning Journey
  {
    name: 'Journey Begins',
    description: 'Complete your first 10 exams',
    icon: '🎯',
    category: 'LEARNING_JOURNEY' as AchievementCategory,
    targetValue: 10,
    points: 50,
  },
  {
    name: 'Committed Learner',
    description: 'Complete 50 exams',
    icon: '📚',
    category: 'LEARNING_JOURNEY' as AchievementCategory,
    targetValue: 50,
    points: 250,
  },
  {
    name: 'Knowledge Seeker',
    description: 'Complete 200 exams',
    icon: '🎓',
    category: 'LEARNING_JOURNEY' as AchievementCategory,
    targetValue: 200,
    points: 1000,
  },

  // Streak Master
  {
    name: 'Streak Starter',
    description: 'Achieve a 3-day streak',
    icon: '🔥',
    category: 'STREAK_MASTER' as AchievementCategory,
    targetValue: 3,
    points: 25,
  },
  {
    name: 'Streak Veteran',
    description: 'Achieve a 14-day streak',
    icon: '🔥',
    category: 'STREAK_MASTER' as AchievementCategory,
    targetValue: 14,
    points: 100,
  },
  {
    name: 'Streak Legend',
    description: 'Achieve a 50-day streak',
    icon: '🔥',
    category: 'STREAK_MASTER' as AchievementCategory,
    targetValue: 50,
    points: 500,
  },

  // Subject Expert
  {
    name: 'Subject Explorer',
    description: 'Complete exams in 3 different subjects',
    icon: '🌍',
    category: 'SUBJECT_EXPERT' as AchievementCategory,
    targetValue: 3,
    points: 50,
  },
  {
    name: 'Renaissance Scholar',
    description: 'Complete exams in 10 different subjects',
    icon: '🎨',
    category: 'SUBJECT_EXPERT' as AchievementCategory,
    targetValue: 10,
    points: 200,
  },

  // Score Excellence
  {
    name: 'High Achiever',
    description: 'Score above 80% on 10 exams',
    icon: '⭐',
    category: 'SCORE_EXCELLENCE' as AchievementCategory,
    targetValue: 10,
    points: 100,
  },
  {
    name: 'Excellence Personified',
    description: 'Score above 90% on 25 exams',
    icon: '🌟',
    category: 'SCORE_EXCELLENCE' as AchievementCategory,
    targetValue: 25,
    points: 300,
  },
  {
    name: 'Perfectionist',
    description: 'Score 100% on 5 different exams',
    icon: '💯',
    category: 'SCORE_EXCELLENCE' as AchievementCategory,
    targetValue: 5,
    points: 500,
  },

  // Speed Demon
  {
    name: 'Quick Thinker',
    description: 'Complete 5 exams in under 10 minutes each',
    icon: '⚡',
    category: 'SPEED_DEMON' as AchievementCategory,
    targetValue: 5,
    points: 75,
  },
  {
    name: 'Lightning Fast',
    description: 'Complete 10 exams in under 5 minutes each',
    icon: '⚡',
    category: 'SPEED_DEMON' as AchievementCategory,
    targetValue: 10,
    points: 200,
  },

  // Milestones
  {
    name: 'First Week',
    description: 'Use ScoreX for 7 days',
    icon: '📅',
    category: 'MILESTONE' as AchievementCategory,
    targetValue: 7,
    points: 25,
  },
  {
    name: 'First Month',
    description: 'Use ScoreX for 30 days',
    icon: '🗓️',
    category: 'MILESTONE' as AchievementCategory,
    targetValue: 30,
    points: 100,
  },
  {
    name: 'Study Time Champion',
    description: 'Spend 10 hours studying',
    icon: '⏱️',
    category: 'MILESTONE' as AchievementCategory,
    targetValue: 36000, // 10 hours in seconds
    points: 150,
  },
];

/**
 * Initialize achievements in database
 */
export async function initializeAchievements() {
  try {
    for (const achievementDef of ACHIEVEMENT_DEFINITIONS) {
      await prisma.achievement.upsert({
        where: { name: achievementDef.name },
        update: {
          description: achievementDef.description,
          icon: achievementDef.icon,
          category: achievementDef.category,
          targetValue: achievementDef.targetValue,
          points: achievementDef.points,
        },
        create: {
          name: achievementDef.name,
          description: achievementDef.description,
          icon: achievementDef.icon,
          category: achievementDef.category,
          targetValue: achievementDef.targetValue,
          currentValue: 0,
          points: achievementDef.points,
        },
      });
    }
    logger.info('Achievements initialized successfully');
  } catch (error) {
    logger.error('Error initializing achievements', error);
    throw error;
  }
}

/**
 * Update achievement progress for a user
 */
export async function updateAchievementProgress(userId: string) {
  const newlyCompleted: string[] = [];

  try {
    const stats = await prisma.userStats.findUnique({ where: { userId } });
    const streak = await prisma.streak.findUnique({ where: { userId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!stats || !streak || !user) return newlyCompleted;

    // Get high score attempts
    const highScoreAttempts = await prisma.examAttempt.count({
      where: {
        userId,
        percentage: { gte: 80 },
        status: 'COMPLETED',
      },
    });

    const excellentAttempts = await prisma.examAttempt.count({
      where: {
        userId,
        percentage: { gte: 90 },
        status: 'COMPLETED',
      },
    });

    const perfectAttempts = await prisma.examAttempt.count({
      where: {
        userId,
        percentage: 100,
        status: 'COMPLETED',
      },
    });

    const quickAttempts = await prisma.examAttempt.count({
      where: {
        userId,
        timeSpent: { lte: 600 }, // 10 minutes
        status: 'COMPLETED',
      },
    });

    const fastAttempts = await prisma.examAttempt.count({
      where: {
        userId,
        timeSpent: { lte: 300 }, // 5 minutes
        status: 'COMPLETED',
      },
    });

    // Count unique subjects
    const uniqueSubjects = await prisma.exam.findMany({
      where: {
        attempts: {
          some: {
            userId,
            status: 'COMPLETED',
          },
        },
      },
      select: { subject: true },
      distinct: ['subject'],
    });

    // Calculate days since account creation
    const daysSinceJoin = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Progress mapping
    const progressMap = {
      'Journey Begins': stats.totalExams,
      'Committed Learner': stats.totalExams,
      'Knowledge Seeker': stats.totalExams,
      'Streak Starter': streak.currentStreak,
      'Streak Veteran': streak.currentStreak,
      'Streak Legend': streak.currentStreak,
      'Subject Explorer': uniqueSubjects.length,
      'Renaissance Scholar': uniqueSubjects.length,
      'High Achiever': highScoreAttempts,
      'Excellence Personified': excellentAttempts,
      'Perfectionist': perfectAttempts,
      'Quick Thinker': quickAttempts,
      'Lightning Fast': fastAttempts,
      'First Week': daysSinceJoin,
      'First Month': daysSinceJoin,
      'Study Time Champion': stats.totalTimeSpent,
    };

    // Update each achievement
    for (const [achievementName, currentProgress] of Object.entries(progressMap)) {
      const achievement = await prisma.achievement.findUnique({
        where: { name: achievementName },
      });

      if (!achievement) continue;

      // Find or create user achievement
      let userAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (!userAchievement) {
        userAchievement = await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress: currentProgress,
            completed: currentProgress >= achievement.targetValue,
            completedAt: currentProgress >= achievement.targetValue ? new Date() : null,
          },
        });
      } else {
        const wasCompleted = userAchievement.completed;
        const isNowCompleted = currentProgress >= achievement.targetValue;

        userAchievement = await prisma.userAchievement.update({
          where: { id: userAchievement.id },
          data: {
            progress: currentProgress,
            completed: isNowCompleted,
            completedAt: isNowCompleted && !wasCompleted ? new Date() : userAchievement.completedAt,
          },
        });
      }

      // Track newly completed achievements
      if (userAchievement.completed && userAchievement.completedAt) {
        const wasJustCompleted =
          Date.now() - userAchievement.completedAt.getTime() < 5000; // Within 5 seconds
        if (wasJustCompleted) {
          newlyCompleted.push(achievement.name);
          logger.info('Achievement completed', { userId, achievementName: achievement.name });
        }
      }
    }

    return newlyCompleted;
  } catch (error) {
    logger.error('Error updating achievement progress', error, { userId });
    return newlyCompleted;
  }
}

/**
 * Get all achievements for a user with progress
 */
export async function getUserAchievements(userId: string) {
  return await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
    orderBy: [
      { completed: 'desc' },
      { progress: 'desc' },
    ],
  });
}

/**
 * Get unseen achievements (for notifications)
 */
export async function getUnseenAchievements(userId: string) {
  return await prisma.userAchievement.findMany({
    where: {
      userId,
      completed: true,
      seen: false,
    },
    include: {
      achievement: true,
    },
  });
}

/**
 * Mark achievements as seen
 */
export async function markAchievementsAsSeen(userId: string, achievementIds: string[]) {
  await prisma.userAchievement.updateMany({
    where: {
      userId,
      achievementId: { in: achievementIds },
    },
    data: {
      seen: true,
    },
  });
}

/**
 * Get total gamification points for a user
 */
export async function getTotalPoints(userId: string) {
  const badges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });

  const achievements = await prisma.userAchievement.findMany({
    where: { userId, completed: true },
    include: { achievement: true },
  });

  const badgePoints = badges.reduce((sum, ub) => sum + ub.badge.points, 0);
  const achievementPoints = achievements.reduce((sum, ua) => sum + ua.achievement.points, 0);

  return {
    badgePoints,
    achievementPoints,
    totalPoints: badgePoints + achievementPoints,
  };
}
