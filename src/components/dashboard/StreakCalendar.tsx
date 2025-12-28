"use client";

import { Flame, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

interface CalendarDay {
  date: Date;
  activity: number;
  exams: number;
}

interface AttemptSummary {
  completedAt: string | null;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
}

const getActivityColor = (level: number) => {
  switch (level) {
    case 0: return "bg-muted/30";
    case 1: return "bg-primary/20";
    case 2: return "bg-primary/40";
    case 3: return "bg-primary/60";
    case 4: return "bg-primary";
    default: return "bg-muted/30";
  }
};

export const StreakCalendar = () => {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [streakData, setStreakData] = useState<StreakInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, attemptsRes] = await Promise.all([
          axios.get<StreakInfo>('/api/stats/overview'),
          axios.get<AttemptSummary[]>('/api/stats/attempts'),
        ]);

        setStreakData({
          currentStreak: overviewRes.data.currentStreak || 0,
          longestStreak: overviewRes.data.longestStreak || 0,
        });

        // Generate calendar data based on real attempts
        const attempts = attemptsRes.data;
        const data: CalendarDay[] = [];
        const today = new Date();

        // Create a map of dates to exam counts
        const dateMap = new Map<string, number>();
        attempts.forEach((attempt) => {
          if (attempt.completedAt) {
            const date = new Date(attempt.completedAt);
            const dateKey = date.toDateString();
            dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
          }
        });

        // Generate 90 days of data
        for (let i = 89; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateKey = date.toDateString();
          const exams = dateMap.get(dateKey) || 0;

          // Calculate activity level (0-4) based on exams completed
          let activity = 0;
          if (exams >= 4) activity = 4;
          else if (exams === 3) activity = 3;
          else if (exams === 2) activity = 2;
          else if (exams === 1) activity = 1;

          data.push({ date, activity, exams });
        }

        setCalendarData(data);
      } catch (error) {
        console.error('Failed to fetch streak data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="morphic-card p-6">
        <Skeleton className="h-8 w-3/4 mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Split into weeks
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <div className="morphic-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Activity Streak</h3>
          <p className="text-sm text-muted-foreground">Last 90 days of learning</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Current streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">{streakData?.currentStreak || 0} days</span>
          </div>

          {/* Longest streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Best: {streakData?.longestStreak || 0}</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-4 h-4 rounded-sm ${getActivityColor(day.activity)} transition-all hover:scale-125 hover:ring-2 hover:ring-primary/50 cursor-pointer`}
                title={`${day.date.toLocaleDateString()}: ${day.exams} exam${day.exams !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
