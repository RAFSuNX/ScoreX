import { Metadata } from 'next';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGlobalLeaderboard, getWeeklyLeaderboard, getUserRank } from '@/lib/gamification/leaderboard';
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Award, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Leaderboard | ScoreX',
  description: 'Compete with other learners',
};

export default async function LeaderboardPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const [
    pointsLeaderboard,
    examsLeaderboard,
    streakLeaderboard,
    weeklyLeaderboard,
    userPointsRank,
  ] = await Promise.all([
    getGlobalLeaderboard('points', 50),
    getGlobalLeaderboard('exams', 50),
    getGlobalLeaderboard('streak', 50),
    getWeeklyLeaderboard(50),
    getUserRank(session.user.id, 'points'),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          See how you rank against other learners
        </p>
      </div>

      {/* User Rank Card */}
      {userPointsRank && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-300 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Global Rank</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  #{userPointsRank.rank}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  out of {userPointsRank.total.toLocaleString()} learners
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Top</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {((userPointsRank.rank / userPointsRank.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="points" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="points" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Points
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="streak" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Streak
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            This Week
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Top Learners by Points
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All time ranking
              </p>
            </div>
            <LeaderboardTable
              entries={pointsLeaderboard}
              currentUserId={session.user.id}
              type="points"
            />
          </div>
        </TabsContent>

        <TabsContent value="exams">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Most Exams Completed
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All time ranking
              </p>
            </div>
            <LeaderboardTable
              entries={examsLeaderboard}
              currentUserId={session.user.id}
              type="exams"
            />
          </div>
        </TabsContent>

        <TabsContent value="streak">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Longest Learning Streaks
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current streaks
              </p>
            </div>
            <LeaderboardTable
              entries={streakLeaderboard}
              currentUserId={session.user.id}
              type="streak"
            />
          </div>
        </TabsContent>

        <TabsContent value="weekly">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Top Performers This Week
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last 7 days
              </p>
            </div>
            <LeaderboardTable
              entries={weeklyLeaderboard}
              currentUserId={session.user.id}
              type="exams"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
