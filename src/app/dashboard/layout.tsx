import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await getAuthSession()) as Session | null;

  if (!session || !session.user) {
    redirect("/login");
  }

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

      <DashboardSidebar />
      <MobileNav />

      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-8 px-4 lg:px-8 pb-24">
        {children}
      </main>
    </div>
  );
}
