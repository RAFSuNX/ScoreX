"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BarChart3, TrendingUp, Target, Clock, Award, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import axios from "axios";

export default function StatsPage() {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, attemptsRes, overviewRes] = await Promise.all([
          axios.get('/api/stats/user'),
          axios.get('/api/stats/attempts'),
          axios.get('/api/stats/overview'),
        ]);
        setUserStats(statsRes.data);
        setAttempts(attemptsRes.data);
        setStreak({ currentStreak: overviewRes.data.currentStreak || 0 });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const avgScore = attempts.length > 0
    ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
    : 0;

  const totalTimeSpent = attempts.reduce((sum, a) => sum + a.timeSpent, 0);

  const performanceData = attempts.slice(0, 7).reverse().map((attempt, i) => ({
    name: `Attempt ${i + 1}`,
    score: attempt.percentage,
  }));

  type SubjectStats = { count: number; totalScore: number };
  const subjectStats = attempts.reduce((acc, attempt) => {
    const subject = attempt.exam.subject;
    if (!acc[subject]) {
      acc[subject] = { count: 0, totalScore: 0 };
    }
    acc[subject].count++;
    acc[subject].totalScore += attempt.percentage;
    return acc;
  }, {} as Record<string, SubjectStats>);

  const subjectData = (Object.entries(subjectStats) as [string, SubjectStats][]).map(([subject, data]) => ({
    name: subject,
    value: Math.round(data.totalScore / data.count),
  }));

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">
          <span className="gradient-text">Statistics</span>
        </h1>
        <p className="text-muted-foreground">
          Track your learning progress and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Exams</span>
          </div>
          <p className="text-3xl font-bold">{userStats?.totalExams || 0}</p>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Average Score</span>
          </div>
          <p className="text-3xl font-bold">{avgScore.toFixed(1)}%</p>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Award className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Exams Passed</span>
          </div>
          <p className="text-3xl font-bold">{userStats?.examsPassed || 0}</p>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Target className="h-5 w-5 text-yellow-500" />
            </div>
            <span className="text-sm text-muted-foreground">Pass Rate</span>
          </div>
          <p className="text-3xl font-bold">
            {userStats && userStats.totalExams > 0
              ? ((userStats.examsPassed / userStats.totalExams) * 100).toFixed(0)
              : 0}%
          </p>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <span className="text-sm text-muted-foreground">Time Spent</span>
          </div>
          <p className="text-3xl font-bold">{Math.round(totalTimeSpent / 60)}h</p>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-sm text-muted-foreground">Study Streak</span>
          </div>
          <p className="text-3xl font-bold">{streak?.currentStreak || 0} days</p>
        </div>
      </div>

      {attempts.length > 0 && (
        <>
          <div className="morphic-card p-6">
            <h2 className="text-xl font-bold mb-6">Performance Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {subjectData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="morphic-card p-6">
                <h2 className="text-xl font-bold mb-6">Subject Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="morphic-card p-6">
                <h2 className="text-xl font-bold mb-6">Recent Attempts</h2>
                <div className="space-y-4">
                  {attempts.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">{attempt.exam.title}</p>
                        <p className="text-sm text-muted-foreground">{attempt.exam.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${attempt.percentage >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                          {attempt.percentage.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {attempts.length === 0 && (
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">No Statistics Yet</h3>
          <p className="text-muted-foreground">Complete some exams to see your statistics here</p>
        </div>
      )}
    </div>
  );
}
