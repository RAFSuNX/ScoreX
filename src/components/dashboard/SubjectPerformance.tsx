"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

const getScoreColor = (score: number) => {
  if (score >= 85) return "hsl(252, 100%, 69%)"; // primary - excellent
  if (score >= 70) return "hsl(252, 60%, 55%)"; // primary lighter - good
  return "hsl(240, 20%, 40%)"; // muted - needs work
};

export const SubjectPerformance = () => {
  const [subjectData, setSubjectData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const response = await axios.get('/api/stats/subjects');
        setSubjectData(response.data);
      } catch (error) {
        console.error("Failed to fetch subject performance", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjectData();
  }, []);

  if (isLoading) {
    return (
      <div className="morphic-card p-6 h-full">
        <Skeleton className="h-8 w-3/4 mb-6" />
        <Skeleton className="h-48 w-full mb-6 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  if (!subjectData || subjectData.length === 0) {
    return (
      <div className="morphic-card p-6 h-full flex items-center justify-center">
        <p className="text-muted-foreground">No subject performance data yet.</p>
      </div>
    );
  }

  const chartData = subjectData.map(s => ({
    name: s.subject,
    value: 1, // Each slice is of equal size for now
    score: s.averageScore || 0,
    fill: getScoreColor(s.averageScore || 0),
  }));

  return (
    <div className="morphic-card p-6 h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-1">Subject Performance</h3>
        <p className="text-sm text-muted-foreground">Your average scores across subjects</p>
      </div>

      {/* Chart */}
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(240 15% 12%)",
                border: "1px solid hsl(240 15% 20%)",
                borderRadius: "12px",
                padding: "12px",
              }}
              formatter={(value, name, props) => [
                `${(props.payload.score || 0).toFixed(0)}% avg`,
                String(name || '')
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Subject list */}
      <div className="space-y-3">
        {subjectData.map((subject) => (
          <div key={subject.subject} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getScoreColor(subject.averageScore) }}
              />
              <span className="text-sm text-foreground">{subject.subject}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-bold"
                style={{ color: getScoreColor(subject.averageScore || 0) }}
              >
                {(subject.averageScore || 0).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
