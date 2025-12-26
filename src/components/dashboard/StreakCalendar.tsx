import { Flame, Trophy } from "lucide-react";

// Generate mock data for 90 days
const generateCalendarData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random activity level (0-4)
    const activity = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0;
    
    data.push({
      date,
      activity,
      exams: activity,
    });
  }
  
  return data;
};

const calendarData = generateCalendarData();

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
  // Split into weeks
  const weeks: typeof calendarData[] = [];
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
            <span className="font-bold text-primary">12 days</span>
          </div>
          
          {/* Longest streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Best: 28</span>
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
