import { FileText, TrendingUp, Flame, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const stats = [
  { 
    label: "Total Exams", 
    value: 47, 
    icon: FileText, 
    suffix: "",
    change: "+5 this week"
  },
  { 
    label: "Average Score", 
    value: 82, 
    icon: TrendingUp, 
    suffix: "%",
    change: "+3% from last month"
  },
  { 
    label: "Current Streak", 
    value: 12, 
    icon: Flame, 
    suffix: " days",
    change: "Personal best!"
  },
  { 
    label: "Study Time", 
    value: 156, 
    icon: Clock, 
    suffix: " hrs",
    change: "23 hrs this week"
  },
];

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

  return (
    <span className="number-badge text-4xl">{displayValue}{suffix}</span>
  );
};

export const StatsOverview = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="morphic-card p-6 group hover:-translate-y-1 transition-all duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              {stat.change}
            </div>
          </div>
          
          {/* Value */}
          <div className="mb-1">
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          </div>
          
          {/* Label */}
          <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};
