import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const subjectData = [
  { name: "Mathematics", score: 85, exams: 12 },
  { name: "Programming", score: 92, exams: 15 },
  { name: "Science", score: 78, exams: 8 },
  { name: "History", score: 70, exams: 6 },
  { name: "Languages", score: 88, exams: 6 },
];

const getScoreColor = (score: number) => {
  if (score >= 85) return "hsl(252, 100%, 69%)"; // primary - excellent
  if (score >= 70) return "hsl(252, 60%, 55%)"; // primary lighter - good
  return "hsl(240, 20%, 40%)"; // muted - needs work
};

export const SubjectPerformance = () => {
  const chartData = subjectData.map(s => ({
    name: s.name,
    value: s.exams,
    score: s.score,
    fill: getScoreColor(s.score),
  }));

  return (
    <div className="morphic-card p-6 h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-1">Subject Performance</h3>
        <p className="text-sm text-muted-foreground">Your scores across subjects</p>
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
              formatter={(value: number, name: string, props: any) => [
                `${props.payload.score}% avg`,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Subject list */}
      <div className="space-y-3">
        {subjectData.map((subject) => (
          <div key={subject.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getScoreColor(subject.score) }}
              />
              <span className="text-sm text-foreground">{subject.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{subject.exams} exams</span>
              <span 
                className="text-sm font-bold"
                style={{ color: getScoreColor(subject.score) }}
              >
                {subject.score}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
