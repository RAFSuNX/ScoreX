import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { SubjectPerformance } from "@/components/dashboard/SubjectPerformance";
import { RecentExams } from "@/components/dashboard/RecentExams";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[60%] h-[60%]"
          style={{
            background: 'radial-gradient(ellipse at top right, hsl(252 100% 69% / 0.08) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[40%] h-[40%]"
          style={{
            background: 'radial-gradient(ellipse at bottom left, hsl(252 60% 50% / 0.05) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-8 px-4 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-foreground mb-2">
              Welcome back, <span className="gradient-text">John</span>
            </h1>
            <p className="text-muted-foreground">
              Track your progress and keep the streak going!
            </p>
          </div>

          {/* Stats Overview */}
          <StatsOverview />

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Streak Calendar */}
            <div className="lg:col-span-2">
              <StreakCalendar />
            </div>

            {/* Subject Performance */}
            <div className="lg:col-span-1">
              <SubjectPerformance />
            </div>
          </div>

          {/* Recent Exams */}
          <RecentExams />
        </div>
      </main>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
