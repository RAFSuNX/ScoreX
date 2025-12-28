"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";

interface ExamAttemptSummary {
  percentage: number | null;
}

interface RecentExam {
  id: string;
  subject: string;
  createdAt: string;
  questions: { id: string }[];
  attempts: ExamAttemptSummary[];
}

const getScoreStyle = (score: number) => {
  if (score >= 85) return "text-primary bg-primary/10";
  if (score >= 70) return "text-muted-foreground bg-muted/50";
  return "text-destructive bg-destructive/10";
};

export const RecentExams = ({ exams }: { exams: RecentExam[] }) => {
  return (
    <div className="morphic-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Recent Exams</h3>
          <p className="text-sm text-muted-foreground">Your latest exam results</p>
        </div>
        <Link href="/dashboard/exams">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Subject</th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Score</th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 hidden sm:table-cell">Date</th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 hidden md:table-cell">Questions</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {exams.map((exam, index) => (
              <tr 
                key={exam.id} 
                className={`transition-colors hover:bg-muted/20 ${index % 2 === 0 ? "bg-muted/5" : ""}`}
              >
                <td className="py-4 text-sm font-medium text-foreground">
                  {exam.subject}
                </td>
                <td className="py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getScoreStyle(exam.attempts.length > 0 && exam.attempts[0].percentage !== null ? exam.attempts[0].percentage : 0)}`}>
                    {exam.attempts.length > 0 && exam.attempts[0].percentage !== null ? `${exam.attempts[0].percentage.toFixed(0)}%` : 'N/A'}
                  </span>
                </td>
                <td className="py-4 text-center text-sm text-muted-foreground hidden sm:table-cell">
                  {format(new Date(exam.createdAt), "MMM d")}
                </td>
                <td className="py-4 text-center text-sm text-muted-foreground hidden md:table-cell">
                  {exam.questions.length}
                </td>
                <td className="py-4 text-right">
                  <Link href={`/dashboard/exam/${exam.id}`}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
