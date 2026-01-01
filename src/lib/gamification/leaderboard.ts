import { prisma } from '@/lib/prisma';
import { getTotalPoints } from './achievements';

export type LeaderboardEntry = {
  userId: string;
  name: string | null;
  email: string;
  totalPoints: number;
  badgeCount: number;
  achievementCount: number;
  totalExams: number;
  avgScore: number;
  currentStreak: number;
  rank: number;
};

export type LeaderboardType = 'points' | 'exams' | 'streak' | 'avgScore';

/**
 * Get global leaderboard
 */
export async function getGlobalLeaderboard(
  type: LeaderboardType = 'points',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const users = await prisma.user.findMany({
    include: {
      stats: true,
      streak: true,
      badges: {
        include: { badge: true },
      },
      achievements: {
        where: { completed: true },
        include: { achievement: true },
      },
    },
  });

  // Calculate points and create leaderboard entries
  const entries: LeaderboardEntry[] = await Promise.all(
    users.map(async (user) => {
      const points = await getTotalPoints(user.id);
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        totalPoints: points.totalPoints,
        badgeCount: user.badges.length,
        achievementCount: user.achievements.length,
        totalExams: user.stats?.totalExams ?? 0,
        avgScore: user.stats?.avgScore ?? 0,
        currentStreak: user.streak?.currentStreak ?? 0,
        rank: 0, // Will be set below
      };
    })
  );

  // Sort based on leaderboard type
  let sorted: LeaderboardEntry[];
  switch (type) {
    case 'points':
      sorted = entries.sort((a, b) => b.totalPoints - a.totalPoints);
      break;
    case 'exams':
      sorted = entries.sort((a, b) => b.totalExams - a.totalExams);
      break;
    case 'streak':
      sorted = entries.sort((a, b) => b.currentStreak - a.currentStreak);
      break;
    case 'avgScore':
      sorted = entries.sort((a, b) => b.avgScore - a.avgScore);
      break;
    default:
      sorted = entries.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  // Assign ranks
  sorted.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return sorted.slice(0, limit);
}

/**
 * Get user's rank in leaderboard
 */
export async function getUserRank(
  userId: string,
  type: LeaderboardType = 'points'
): Promise<{ rank: number; total: number } | null> {
  const leaderboard = await getGlobalLeaderboard(type, 1000);
  const userEntry = leaderboard.find((entry) => entry.userId === userId);

  if (!userEntry) return null;

  return {
    rank: userEntry.rank,
    total: leaderboard.length,
  };
}

/**
 * Get subject-specific leaderboard
 */
export async function getSubjectLeaderboard(
  subject: string,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  // Get users who have completed exams in this subject
  const attempts = await prisma.examAttempt.findMany({
    where: {
      status: 'COMPLETED',
      exam: {
        subject,
      },
    },
    include: {
      user: {
        include: {
          stats: true,
          streak: true,
          badges: true,
          achievements: {
            where: { completed: true },
          },
        },
      },
      exam: true,
    },
  });

  // Group by user and calculate subject-specific stats
  const userStats = new Map<string, {
    user: {
      name: string | null;
      email: string;
      badges?: { length: number };
      achievements?: { length: number };
      streak?: { currentStreak: number } | null;
    };
    totalExams: number;
    avgScore: number;
  }>();

  attempts.forEach((attempt) => {
    const existing = userStats.get(attempt.userId);
    if (!existing) {
      userStats.set(attempt.userId, {
        user: attempt.user,
        totalExams: 1,
        avgScore: attempt.percentage ?? 0,
      });
    } else {
      existing.totalExams += 1;
      existing.avgScore = (existing.avgScore * (existing.totalExams - 1) + (attempt.percentage ?? 0)) / existing.totalExams;
    }
  });

  // Create leaderboard entries
  const entries: LeaderboardEntry[] = await Promise.all(
    Array.from(userStats.entries()).map(async ([userId, stats]) => {
      const points = await getTotalPoints(userId);
      return {
        userId,
        name: stats.user.name,
        email: stats.user.email,
        totalPoints: points.totalPoints,
        badgeCount: stats.user.badges?.length ?? 0,
        achievementCount: stats.user.achievements?.length ?? 0,
        totalExams: stats.totalExams,
        avgScore: stats.avgScore,
        currentStreak: stats.user.streak?.currentStreak ?? 0,
        rank: 0,
      };
    })
  );

  // Sort by average score for subject leaderboard
  const sorted = entries.sort((a, b) => {
    if (b.avgScore === a.avgScore) {
      return b.totalExams - a.totalExams;
    }
    return b.avgScore - a.avgScore;
  });

  // Assign ranks
  sorted.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return sorted.slice(0, limit);
}

/**
 * Get top performers this week
 */
export async function getWeeklyLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentAttempts = await prisma.examAttempt.findMany({
    where: {
      status: 'COMPLETED',
      completedAt: {
        gte: oneWeekAgo,
      },
    },
    include: {
      user: {
        include: {
          stats: true,
          streak: true,
          badges: true,
          achievements: {
            where: { completed: true },
          },
        },
      },
    },
  });

  // Group by user
  const userWeeklyStats = new Map<string, {
    user: {
      name: string | null;
      email: string;
      badges?: { length: number };
      achievements?: { length: number };
      streak?: { currentStreak: number } | null;
    };
    examsThisWeek: number;
    avgScoreThisWeek: number;
  }>();

  recentAttempts.forEach((attempt) => {
    const existing = userWeeklyStats.get(attempt.userId);
    if (!existing) {
      userWeeklyStats.set(attempt.userId, {
        user: attempt.user,
        examsThisWeek: 1,
        avgScoreThisWeek: attempt.percentage ?? 0,
      });
    } else {
      existing.examsThisWeek += 1;
      existing.avgScoreThisWeek =
        (existing.avgScoreThisWeek * (existing.examsThisWeek - 1) +
          (attempt.percentage ?? 0)) /
        existing.examsThisWeek;
    }
  });

  // Create leaderboard entries
  const entries: LeaderboardEntry[] = await Promise.all(
    Array.from(userWeeklyStats.entries()).map(async ([userId, stats]) => {
      const points = await getTotalPoints(userId);
      return {
        userId,
        name: stats.user.name,
        email: stats.user.email,
        totalPoints: points.totalPoints,
        badgeCount: stats.user.badges?.length ?? 0,
        achievementCount: stats.user.achievements?.length ?? 0,
        totalExams: stats.examsThisWeek,
        avgScore: stats.avgScoreThisWeek,
        currentStreak: stats.user.streak?.currentStreak ?? 0,
        rank: 0,
      };
    })
  );

  // Sort by exams completed this week
  const sorted = entries.sort((a, b) => {
    if (b.totalExams === a.totalExams) {
      return b.avgScore - a.avgScore;
    }
    return b.totalExams - a.totalExams;
  });

  // Assign ranks
  sorted.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return sorted.slice(0, limit);
}

/**
 * Get user's surrounding competitors (users ranked just above and below)
 */
export async function getNearbyCompetitors(
  userId: string,
  type: LeaderboardType = 'points',
  range: number = 3
): Promise<LeaderboardEntry[]> {
  const leaderboard = await getGlobalLeaderboard(type, 1000);
  const userIndex = leaderboard.findIndex((entry) => entry.userId === userId);

  if (userIndex === -1) return [];

  const start = Math.max(0, userIndex - range);
  const end = Math.min(leaderboard.length, userIndex + range + 1);

  return leaderboard.slice(start, end);
}
