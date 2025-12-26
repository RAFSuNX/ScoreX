"use client";

import { LayoutDashboard, FileText, PlusCircle, BarChart3, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "My Exams", href: "/dashboard/exams" },
  { icon: PlusCircle, label: "Create Exam", href: "/dashboard/create" },
  { icon: BarChart3, label: "Statistics", href: "/dashboard/stats" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50" />
        
        <a href="/" className="relative flex items-center">
          <span className="text-xl font-black tracking-tight">
            Score<span className="gradient-text">X</span>
          </span>
        </a>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-lg bg-muted/50"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 pt-16">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
          <nav className="relative p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};
