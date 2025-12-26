import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const recentExams = [
  { id: 1, subject: "JavaScript Fundamentals", score: 92, date: "2024-01-15", time: "45 min" },
  { id: 2, subject: "React Hooks Deep Dive", score: 88, date: "2024-01-14", time: "38 min" },
  { id: 3, subject: "Data Structures", score: 75, date: "2024-01-13", time: "52 min" },
  { id: 4, subject: "World War II History", score: 68, date: "2024-01-12", time: "30 min" },
  { id: 5, subject: "Calculus I", score: 85, date: "2024-01-11", time: "55 min" },
  { id: 6, subject: "Spanish Vocabulary", score: 95, date: "2024-01-10", time: "20 min" },
  { id: 7, subject: "Biology Basics", score: 82, date: "2024-01-09", time: "35 min" },
  { id: 8, subject: "CSS Grid & Flexbox", score: 90, date: "2024-01-08", time: "28 min" },
];

const getScoreStyle = (score: number) => {
  if (score >= 85) return "text-primary bg-primary/10";
  if (score >= 70) return "text-muted-foreground bg-muted/50";
  return "text-destructive bg-destructive/10";
};

export const RecentExams = () => {
  return (
    <div className="morphic-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Recent Exams</h3>
          <p className="text-sm text-muted-foreground">Your latest exam results</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Subject</th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Score</th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 hidden sm:table-cell">Date</th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 hidden md:table-cell">Time</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {recentExams.map((exam, index) => (
              <tr 
                key={exam.id} 
                className={`transition-colors hover:bg-muted/20 ${index % 2 === 0 ? "bg-muted/5" : ""}`}
              >
                <td className="py-4 text-sm font-medium text-foreground">
                  {exam.subject}
                </td>
                <td className="py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getScoreStyle(exam.score)}`}>
                    {exam.score}%
                  </span>
                </td>
                <td className="py-4 text-center text-sm text-muted-foreground hidden sm:table-cell">
                  {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="py-4 text-center text-sm text-muted-foreground hidden md:table-cell">
                  {exam.time}
                </td>
                <td className="py-4 text-right">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
