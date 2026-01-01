import { Metadata } from 'next';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserBadges } from '@/lib/gamification/badges';
import { getUserAchievements, getTotalPoints } from '@/lib/gamification/achievements';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Achievements | ScoreX',
  description: 'View your badges and achievements',
};

export default async function AchievementsPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const userBadges = await getUserBadges(session.user.id);
  const userAchievements = await getUserAchievements(session.user.id);
  const points = await getTotalPoints(session.user.id);

  const completedAchievements = userAchievements.filter((ua) => ua.completed);
  const inProgressAchievements = userAchievements.filter((ua) => !ua.completed);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Achievements & Badges
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey and unlock rewards
        </p>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-300 dark:border-yellow-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {points.totalPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-300 dark:border-blue-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {userBadges.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {completedAchievements.length}/{userAchievements.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {/* Completed */}
          {completedAchievements.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-green-500" />
                Completed ({completedAchievements.length})
              </h2>
              <div className="space-y-3">
                {completedAchievements.map((ua) => (
                  <AchievementCard
                    key={ua.id}
                    name={ua.achievement.name}
                    description={ua.achievement.description}
                    icon={ua.achievement.icon}
                    category={ua.achievement.category}
                    progress={ua.progress}
                    targetValue={ua.achievement.targetValue}
                    points={ua.achievement.points}
                    completed={ua.completed}
                    completedAt={ua.completedAt || undefined}
                    isNew={!ua.seen}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {inProgressAchievements.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-blue-500" />
                In Progress ({inProgressAchievements.length})
              </h2>
              <div className="space-y-3">
                {inProgressAchievements.map((ua) => (
                  <AchievementCard
                    key={ua.id}
                    name={ua.achievement.name}
                    description={ua.achievement.description}
                    icon={ua.achievement.icon}
                    category={ua.achievement.category}
                    progress={ua.progress}
                    targetValue={ua.achievement.targetValue}
                    points={ua.achievement.points}
                    completed={ua.completed}
                  />
                ))}
              </div>
            </div>
          )}

          {userAchievements.length === 0 && (
            <Card className="p-12 text-center">
              <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Complete exams to start unlocking achievements!
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          {userBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userBadges.map((ub) => (
                <BadgeCard
                  key={ub.id}
                  name={ub.badge.name}
                  description={ub.badge.description}
                  icon={ub.badge.icon}
                  category={ub.badge.category}
                  requirement={ub.badge.requirement}
                  points={ub.badge.points}
                  unlocked={true}
                  unlockedAt={ub.unlockedAt}
                  isNew={!ub.seen}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Complete exams to start earning badges!
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
