'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

type Reward = {
  type: 'badge' | 'achievement';
  name: string;
  description: string;
  icon: string;
  points: number;
};

type CelebrationModalProps = {
  rewards: Reward[];
  onClose: () => void;
};

export function CelebrationModal({ rewards, onClose }: CelebrationModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Trigger confetti when modal opens
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB'],
    });

    // Continuous confetti for achievements
    const interval = setInterval(() => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#FFA500'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#FFA500'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const currentReward = rewards[currentIndex];
  const hasMore = currentIndex < rewards.length - 1;

  const handleNext = () => {
    if (hasMore) {
      setCurrentIndex(currentIndex + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative max-w-md w-full p-8 bg-gradient-to-br from-yellow-50 via-white to-purple-50 dark:from-yellow-950/20 dark:via-gray-950 dark:to-purple-950/20 border-2 border-yellow-400 dark:border-yellow-600">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sparkles decoration */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles className="w-12 h-12 text-yellow-500" />
              </motion.div>
            </div>

            <div className="text-center space-y-6">
              {/* Title */}
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-block mb-2"
                >
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-purple-600 bg-clip-text text-transparent">
                  {currentReward.type === 'badge' ? 'New Badge Unlocked!' : 'Achievement Completed!'}
                </h2>
              </div>

              {/* Icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="text-8xl"
              >
                {currentReward.icon}
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentReward.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentReward.description}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                    +{currentReward.points} points
                  </span>
                </div>
              </motion.div>

              {/* Progress indicator */}
              {rewards.length > 1 && (
                <div className="flex justify-center gap-2">
                  {rewards.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'bg-yellow-500 w-6'
                          : index < currentIndex
                          ? 'bg-yellow-300'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-white font-semibold"
                size="lg"
              >
                {hasMore ? 'Next' : 'Awesome!'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
