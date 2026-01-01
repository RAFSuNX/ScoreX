'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type LeaderboardEntry = {
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

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  type?: 'points' | 'exams' | 'streak' | 'avgScore';
};

export function LeaderboardTable({
  entries,
  currentUserId,
  type = 'points',
}: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-semibold text-gray-500">
            {rank}
          </span>
        );
    }
  };

  const getDisplayValue = (entry: LeaderboardEntry) => {
    switch (type) {
      case 'points':
        return `${entry.totalPoints.toLocaleString()} pts`;
      case 'exams':
        return `${entry.totalExams} exams`;
      case 'streak':
        return `${entry.currentStreak} days`;
      case 'avgScore':
        return `${entry.avgScore.toFixed(1)}%`;
      default:
        return '';
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId;
        const isTopThree = entry.rank <= 3;

        return (
          <Card
            key={entry.userId}
            className={`p-4 transition-all ${
              isCurrentUser
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-300 dark:border-blue-700 ring-2 ring-blue-400'
                : isTopThree
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/10 dark:to-amber-950/10 border-yellow-200 dark:border-yellow-800'
                : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0">{getRankIcon(entry.rank)}</div>

              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                  {getInitials(entry.name, entry.email)}
                </AvatarFallback>
              </Avatar>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {entry.name || entry.email.split('@')[0]}
                  </p>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {entry.badgeCount} badges
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {entry.achievementCount} achievements
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 text-right">
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  {getDisplayValue(entry)}
                </p>
                {type === 'points' && entry.currentStreak > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {entry.currentStreak} day streak
                  </p>
                )}
                {type !== 'avgScore' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Avg: {entry.avgScore.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {entries.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No leaderboard data yet. Complete some exams to get started!
          </p>
        </Card>
      )}
    </div>
  );
}
