"use client";

import { LayoutDashboard, FileText, PlusCircle, BarChart3, Settings, LogOut, Crown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "My Exams", href: "/dashboard/exams" },
  { icon: PlusCircle, label: "Create Exam", href: "/dashboard/create" },
  { icon: BarChart3, label: "Statistics", href: "/dashboard/stats" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 z-40 hidden lg:flex flex-col">
      {/* Glass background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-r border-border/50" />
      
      <div className="relative flex flex-col h-full p-4">
        {/* Logo - text only brand */}
        <a href="/" className="flex items-center px-3 py-4 mb-6">
          <span className="text-2xl font-black tracking-tight">
            Score<span className="gradient-text">X</span>
          </span>
        </a>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile section */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/30">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary blur-md opacity-30" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{session?.user?.name}</p>
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary font-medium">Pro Plan</span>
              </div>
            </div>
            <button onClick={() => signOut()} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
