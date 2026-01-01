'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

type BadgeCardProps = {
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  isNew?: boolean;
};

export function BadgeCard({
  name,
  description,
  icon,
  category,
  requirement,
  points,
  unlocked,
  unlockedAt,
  isNew = false,
}: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative p-6 transition-all ${
          unlocked
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-300 dark:border-yellow-700'
            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60'
        }`}
      >
        {isNew && unlocked && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NEW
            </Badge>
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon */}
          <div
            className={`text-6xl ${
              unlocked
                ? 'filter-none'
                : 'filter grayscale opacity-50'
            }`}
          >
            {unlocked ? icon : <Lock className="w-12 h-12 text-gray-400" />}
          </div>

          {/* Name */}
          <h3
            className={`font-bold text-lg ${
              unlocked
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {name}
          </h3>

          {/* Description */}
          <p
            className={`text-sm ${
              unlocked
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            {description}
          </p>

          {/* Requirement */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
            <span>•</span>
            <span>{points} pts</span>
          </div>

          {/* Requirement details */}
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            {requirement}
          </p>

          {/* Unlocked date */}
          {unlocked && unlockedAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
