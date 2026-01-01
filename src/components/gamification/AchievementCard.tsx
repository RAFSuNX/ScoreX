'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

type AchievementCardProps = {
  name: string;
  description: string;
  icon: string;
  category: string;
  progress: number;
  targetValue: number;
  points: number;
  completed: boolean;
  completedAt?: Date;
  isNew?: boolean;
};

export function AchievementCard({
  name,
  description,
  icon,
  category,
  progress,
  targetValue,
  points,
  completed,
  completedAt,
  isNew = false,
}: AchievementCardProps) {
  const progressPercentage = Math.min((progress / targetValue) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative p-5 transition-all ${
          completed
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-700'
            : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800'
        }`}
      >
        {isNew && completed && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NEW
            </Badge>
          </div>
        )}

        <div className="flex gap-4">
          {/* Icon */}
          <div
            className={`text-4xl flex-shrink-0 ${
              completed ? 'filter-none' : 'filter grayscale opacity-70'
            }`}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className={`font-semibold text-base ${
                    completed
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {name}
                  {completed && (
                    <Check className="inline-block w-4 h-4 ml-2 text-green-600" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              </div>

              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {points} pts
              </Badge>
            </div>

            {/* Progress */}
            {!completed && (
              <div className="space-y-1">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {progress} / {targetValue}
                  </span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              {completed && completedAt && (
                <>
                  <span>•</span>
                  <span>Completed {new Date(completedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
