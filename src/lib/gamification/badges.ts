import { prisma } from '@/lib/prisma';
import { BadgeCategory } from '@prisma/client';
import { logger } from '@/lib/logger';

// Define all available badges
export const BADGE_DEFINITIONS = [
  // Streak Badges
  {
    name: 'First Steps',
    description: 'Complete your first exam',
    icon: '🎯',
    category: 'STREAK' as BadgeCategory,
    requirement: 'Complete 1 exam',
    points: 10,
    checkCriteria: async (userId: string) => {
      const stats = await prisma.userStats.findUnique({ where: { userId } });
      return (stats?.totalExams ?? 0) >= 1;
    },
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    category: 'STREAK' as BadgeCategory,
    requirement: 'Achieve a 7-day streak',
    points: 50,
    checkCriteria: async (userId: string) => {
      const streak = await prisma.streak.findUnique({ where: { userId } });
      return (streak?.currentStreak ?? 0) >= 7;
    },
  },
  {
    name: 'Month Master',
    description: 'Maintain a 30-day learning streak',
    icon: '🏆',
    category: 'STREAK' as BadgeCategory,
    requirement: 'Achieve a 30-day streak',
    points: 200,
    checkCriteria: async (userId: string) => {
      const streak = await prisma.streak.findUnique({ where: { userId } });
      return (streak?.currentStreak ?? 0) >= 30;
    },
  },
  {
    name: 'Unstoppable',
    description: 'Maintain a 100-day learning streak',
    icon: '⭐',
    category: 'STREAK' as BadgeCategory,
    requirement: 'Achieve a 100-day streak',
    points: 1000,
    checkCriteria: async (userId: string) => {
      const streak = await prisma.streak.findUnique({ where: { userId } });
      return (streak?.currentStreak ?? 0) >= 100;
    },
  },

  // Exam Count Badges
  {
    name: 'Getting Started',
    description: 'Complete 5 exams',
    icon: '📚',
    category: 'EXAM_COUNT' as BadgeCategory,
    requirement: 'Complete 5 exams',
    points: 25,
    checkCriteria: async (userId: string) => {
      const stats = await prisma.userStats.findUnique({ where: { userId } });
      return (stats?.totalExams ?? 0) >= 5;
    },
  },
  {
    name: 'Dedicated Learner',
    description: 'Complete 25 exams',
    icon: '📖',
    category: 'EXAM_COUNT' as BadgeCategory,
    requirement: 'Complete 25 exams',
    points: 100,
    checkCriteria: async (userId: string) => {
      const stats = await prisma.userStats.findUnique({ where: { userId } });
      return (stats?.totalExams ?? 0) >= 25;
    },
  },
  {
    name: 'Learning Machine',
    description: 'Complete 100 exams',
    icon: '🎓',
    category: 'EXAM_COUNT' as BadgeCategory,
    requirement: 'Complete 100 exams',
    points: 500,
    checkCriteria: async (userId: string) => {
      const stats = await prisma.userStats.findUnique({ where: { userId } });
      return (stats?.totalExams ?? 0) >= 100;
    },
  },

  // Score Badges
  {
    name: 'Perfect Score',
    description: 'Score 100% on an exam',
    icon: '💯',
    category: 'SCORE' as BadgeCategory,
    requirement: 'Score 100% on any exam',
    points: 75,
    checkCriteria: async (userId: string) => {
      const perfectAttempt = await prisma.examAttempt.findFirst({
        where: {
          userId,
          percentage: 100,
          status: 'COMPLETED',
        },
      });
      return !!perfectAttempt;
    },
  },
  {
    name: 'Consistent Excellence',
    description: 'Maintain an average score above 90%',
    icon: '🌟',
    category: 'SCORE' as BadgeCategory,
    requirement: 'Average score > 90%',
    points: 150,
    checkCriteria: async (userId: string) => {
      const stats = await prisma.userStats.findUnique({ where: { userId } });
      return (stats?.avgScore ?? 0) >= 90;
    },
  },

  // Subject Mastery Badges
  {
    name: 'Subject Specialist',
    description: 'Score above 80% in 5 exams of the same subject',
    icon: '🎯',
    category: 'SUBJECT_MASTERY' as BadgeCategory,
    requirement: 'Score 80%+ in 5 exams of same subject',
    points: 100,
    checkCriteria: async (userId: string) => {
      const stats = await prisma.userStats.findUnique({ where: { userId } });
      if (!stats?.subjectStats) return false;

      const subjects = stats.subjectStats as Record<string, { count: number; avgScore: number }>;
      return Object.values(subjects).some((subject) =>
        subject.count >= 5 && subject.avgScore >= 80
      );
    },
  },

  // Speed Badges
  {
    name: 'Speed Demon',
    description: 'Complete an exam in under 5 minutes',
    icon: '⚡',
    category: 'SPEED' as BadgeCategory,
    requirement: 'Complete exam in < 5 minutes',
    points: 50,
    checkCriteria: async (userId: string) => {
      const fastAttempt = await prisma.examAttempt.findFirst({
        where: {
          userId,
          timeSpent: { lte: 300 }, // 5 minutes in seconds
          status: 'COMPLETED',
        },
      });
      return !!fastAttempt;
    },
  },

  // Special Badges
  {
    name: 'Early Adopter',
    description: 'Join ScoreX in the first month',
    icon: '🚀',
    category: 'SPECIAL' as BadgeCategory,
    requirement: 'Join in first month of launch',
    points: 500,
    checkCriteria: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      // Set your launch date here
      const launchDate = new Date('2025-01-01');
      const firstMonth = new Date(launchDate);
      firstMonth.setMonth(firstMonth.getMonth() + 1);
      return user ? user.createdAt <= firstMonth : false;
    },
  },
];

/**
 * Initialize badges in database (run once on deployment)
 */
export async function initializeBadges() {
  try {
    for (const badgeDef of BADGE_DEFINITIONS) {
      await prisma.badge.upsert({
        where: { name: badgeDef.name },
        update: {
          description: badgeDef.description,
          icon: badgeDef.icon,
          category: badgeDef.category,
          requirement: badgeDef.requirement,
          points: badgeDef.points,
        },
        create: {
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          category: badgeDef.category,
          requirement: badgeDef.requirement,
          points: badgeDef.points,
        },
      });
    }
    logger.info('Badges initialized successfully');
  } catch (error) {
    logger.error('Error initializing badges', error);
    throw error;
  }
}

/**
 * Check and unlock badges for a user
 */
export async function checkAndUnlockBadges(userId: string) {
  const newBadges: string[] = [];

  try {
    for (const badgeDef of BADGE_DEFINITIONS) {
      // Check if user already has this badge
      const existingBadge = await prisma.userBadge.findFirst({
        where: {
          userId,
          badge: { name: badgeDef.name },
        },
      });

      if (existingBadge) continue;

      // Check if user meets criteria
      const meetsCriteria = await badgeDef.checkCriteria(userId);

      if (meetsCriteria) {
        const badge = await prisma.badge.findUnique({
          where: { name: badgeDef.name },
        });

        if (badge) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
              seen: false,
            },
          });
          newBadges.push(badge.name);
          logger.info('Badge unlocked', { userId, badgeName: badge.name });
        }
      }
    }

    return newBadges;
  } catch (error) {
    logger.error('Error checking badges', error, { userId });
    return newBadges;
  }
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string) {
  return await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true,
    },
    orderBy: {
      unlockedAt: 'desc',
    },
  });
}

/**
 * Get unseen badges for a user (for notifications)
 */
export async function getUnseenBadges(userId: string) {
  return await prisma.userBadge.findMany({
    where: {
      userId,
      seen: false,
    },
    include: {
      badge: true,
    },
  });
}

/**
 * Mark badges as seen
 */
export async function markBadgesAsSeen(userId: string, badgeIds: string[]) {
  await prisma.userBadge.updateMany({
    where: {
      userId,
      badgeId: { in: badgeIds },
    },
    data: {
      seen: true,
    },
  });
}

/**
 * Get badge progress for a user (how close they are to unlocking each badge)
 */
export async function getBadgeProgress(userId: string) {
  const progress = [];

  for (const badgeDef of BADGE_DEFINITIONS) {
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badge: { name: badgeDef.name },
      },
    });

    if (!existingBadge) {
      const meetsCriteria = await badgeDef.checkCriteria(userId);
      progress.push({
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        category: badgeDef.category,
        requirement: badgeDef.requirement,
        unlocked: meetsCriteria,
        points: badgeDef.points,
      });
    }
  }

  return progress;
}
