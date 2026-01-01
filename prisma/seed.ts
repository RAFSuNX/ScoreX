import { PrismaClient, BadgeCategory, AchievementCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Initialize badges
  console.log('Seeding badges...');

  const badges = [
    // Streak Badges
    {
      name: 'First Steps',
      description: 'Complete your first exam',
      icon: '🎯',
      category: BadgeCategory.STREAK,
      requirement: 'Complete 1 exam',
      points: 10,
    },
    {
      name: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      category: BadgeCategory.STREAK,
      requirement: 'Achieve a 7-day streak',
      points: 50,
    },
    {
      name: 'Month Master',
      description: 'Maintain a 30-day learning streak',
      icon: '🏆',
      category: BadgeCategory.STREAK,
      requirement: 'Achieve a 30-day streak',
      points: 200,
    },
    {
      name: 'Unstoppable',
      description: 'Maintain a 100-day learning streak',
      icon: '⭐',
      category: BadgeCategory.STREAK,
      requirement: 'Achieve a 100-day streak',
      points: 1000,
    },
    // Exam Count Badges
    {
      name: 'Getting Started',
      description: 'Complete 5 exams',
      icon: '📚',
      category: BadgeCategory.EXAM_COUNT,
      requirement: 'Complete 5 exams',
      points: 25,
    },
    {
      name: 'Dedicated Learner',
      description: 'Complete 25 exams',
      icon: '📖',
      category: BadgeCategory.EXAM_COUNT,
      requirement: 'Complete 25 exams',
      points: 100,
    },
    {
      name: 'Learning Machine',
      description: 'Complete 100 exams',
      icon: '🎓',
      category: BadgeCategory.EXAM_COUNT,
      requirement: 'Complete 100 exams',
      points: 500,
    },
    // Score Badges
    {
      name: 'Perfect Score',
      description: 'Score 100% on an exam',
      icon: '💯',
      category: BadgeCategory.SCORE,
      requirement: 'Score 100% on any exam',
      points: 75,
    },
    {
      name: 'Consistent Excellence',
      description: 'Maintain an average score above 90%',
      icon: '🌟',
      category: BadgeCategory.SCORE,
      requirement: 'Average score > 90%',
      points: 150,
    },
    // Subject Mastery Badges
    {
      name: 'Subject Specialist',
      description: 'Score above 80% in 5 exams of the same subject',
      icon: '🎯',
      category: BadgeCategory.SUBJECT_MASTERY,
      requirement: 'Score 80%+ in 5 exams of same subject',
      points: 100,
    },
    // Speed Badges
    {
      name: 'Speed Demon',
      description: 'Complete an exam in under 5 minutes',
      icon: '⚡',
      category: BadgeCategory.SPEED,
      requirement: 'Complete exam in < 5 minutes',
      points: 50,
    },
    // Special Badges
    {
      name: 'Early Adopter',
      description: 'Join ScoreX in the first month',
      icon: '🚀',
      category: BadgeCategory.SPECIAL,
      requirement: 'Join in first month of launch',
      points: 500,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    });
  }

  console.log(`✅ Seeded ${badges.length} badges`);

  // Initialize achievements
  console.log('Seeding achievements...');

  const achievements = [
    // Learning Journey
    {
      name: 'Journey Begins',
      description: 'Complete your first 10 exams',
      icon: '🎯',
      category: AchievementCategory.LEARNING_JOURNEY,
      targetValue: 10,
      currentValue: 0,
      points: 50,
    },
    {
      name: 'Committed Learner',
      description: 'Complete 50 exams',
      icon: '📚',
      category: AchievementCategory.LEARNING_JOURNEY,
      targetValue: 50,
      currentValue: 0,
      points: 250,
    },
    {
      name: 'Knowledge Seeker',
      description: 'Complete 200 exams',
      icon: '🎓',
      category: AchievementCategory.LEARNING_JOURNEY,
      targetValue: 200,
      currentValue: 0,
      points: 1000,
    },
    // Streak Master
    {
      name: 'Streak Starter',
      description: 'Achieve a 3-day streak',
      icon: '🔥',
      category: AchievementCategory.STREAK_MASTER,
      targetValue: 3,
      currentValue: 0,
      points: 25,
    },
    {
      name: 'Streak Veteran',
      description: 'Achieve a 14-day streak',
      icon: '🔥',
      category: AchievementCategory.STREAK_MASTER,
      targetValue: 14,
      currentValue: 0,
      points: 100,
    },
    {
      name: 'Streak Legend',
      description: 'Achieve a 50-day streak',
      icon: '🔥',
      category: AchievementCategory.STREAK_MASTER,
      targetValue: 50,
      currentValue: 0,
      points: 500,
    },
    // Subject Expert
    {
      name: 'Subject Explorer',
      description: 'Complete exams in 3 different subjects',
      icon: '🌍',
      category: AchievementCategory.SUBJECT_EXPERT,
      targetValue: 3,
      currentValue: 0,
      points: 50,
    },
    {
      name: 'Renaissance Scholar',
      description: 'Complete exams in 10 different subjects',
      icon: '🎨',
      category: AchievementCategory.SUBJECT_EXPERT,
      targetValue: 10,
      currentValue: 0,
      points: 200,
    },
    // Score Excellence
    {
      name: 'High Achiever',
      description: 'Score above 80% on 10 exams',
      icon: '⭐',
      category: AchievementCategory.SCORE_EXCELLENCE,
      targetValue: 10,
      currentValue: 0,
      points: 100,
    },
    {
      name: 'Excellence Personified',
      description: 'Score above 90% on 25 exams',
      icon: '🌟',
      category: AchievementCategory.SCORE_EXCELLENCE,
      targetValue: 25,
      currentValue: 0,
      points: 300,
    },
    {
      name: 'Perfectionist',
      description: 'Score 100% on 5 different exams',
      icon: '💯',
      category: AchievementCategory.SCORE_EXCELLENCE,
      targetValue: 5,
      currentValue: 0,
      points: 500,
    },
    // Speed Demon
    {
      name: 'Quick Thinker',
      description: 'Complete 5 exams in under 10 minutes each',
      icon: '⚡',
      category: AchievementCategory.SPEED_DEMON,
      targetValue: 5,
      currentValue: 0,
      points: 75,
    },
    {
      name: 'Lightning Fast',
      description: 'Complete 10 exams in under 5 minutes each',
      icon: '⚡',
      category: AchievementCategory.SPEED_DEMON,
      targetValue: 10,
      currentValue: 0,
      points: 200,
    },
    // Milestones
    {
      name: 'First Week',
      description: 'Use ScoreX for 7 days',
      icon: '📅',
      category: AchievementCategory.MILESTONE,
      targetValue: 7,
      currentValue: 0,
      points: 25,
    },
    {
      name: 'First Month',
      description: 'Use ScoreX for 30 days',
      icon: '🗓️',
      category: AchievementCategory.MILESTONE,
      targetValue: 30,
      currentValue: 0,
      points: 100,
    },
    {
      name: 'Study Time Champion',
      description: 'Spend 10 hours studying',
      icon: '⏱️',
      category: AchievementCategory.MILESTONE,
      targetValue: 36000, // 10 hours in seconds
      currentValue: 0,
      points: 150,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✅ Seeded ${achievements.length} achievements`);
  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
