"use client";

import { FileText, TrendingUp, Flame, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Skeleton } from "@/components/ui/skeleton";

const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val: number) => {
    if (suffix === " hrs") {
      return (val / 3600).toFixed(1);
    }
    return Math.round(val);
  }

  return (
    <span className="number-badge text-4xl">{formatValue(displayValue)}{suffix}</span>
  );
};

export const StatsOverview = () => {
  const [stats, setStats] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats/overview');
        const data = response.data;
        const formattedStats = [
          { 
            label: "Total Exams", 
            value: data.totalExams, 
            icon: FileText, 
            suffix: "",
            change: data.totalExamsChange
          },
          { 
            label: "Average Score", 
            value: data.averageScore, 
            icon: TrendingUp, 
            suffix: "%",
            change: data.averageScoreChange
          },
          { 
            label: "Current Streak", 
            value: data.currentStreak, 
            icon: Flame, 
            suffix: " days",
            change: `Best: ${data.longestStreak} days` 
          },
          { 
            label: "Study Time", 
            value: data.totalTimeSpent, 
            icon: Clock, 
            suffix: " hrs",
            change: data.totalTimeSpentChange
          },
        ];
        setStats(formattedStats);
      } catch (error) {
        console.error("Failed to fetch stats overview", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[168px] w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats?.map((stat, index) => (
        <div
          key={stat.label}
          className="morphic-card p-6 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Premium background icon graphic */}
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
            <stat.icon className="w-full h-full text-primary" strokeWidth={1} />
          </div>

          {/* Icon and change badge */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 group-hover:border-primary/20 transition-all">
              <stat.icon className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              {stat.change}
            </div>
          </div>

          {/* Value */}
          <div className="relative mb-1">
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          </div>

          {/* Label */}
          <p className="relative text-sm text-muted-foreground font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};
