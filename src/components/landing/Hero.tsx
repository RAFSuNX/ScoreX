"use client";

import { Button } from "@/components/ui/button";
import { Users, FileCheck, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export const Hero = () => {
  const [stats, setStats] = useState([
    { value: "...", label: "Total Users", icon: Users },
    { value: "...", label: "Exams Created", icon: FileCheck },
    { value: "...", label: "Total Questions", icon: Rocket },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats/platform');
        if (response.data) {
          setStats([
            { value: response.data.totalUsers || "0", label: "Total Users", icon: Users },
            { value: response.data.totalExams || "0", label: "Exams Created", icon: FileCheck },
            { value: response.data.totalQuestions || "0", label: "Total Questions", icon: Rocket },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch platform stats:', error);
        // Keep default values on error
        setStats([
          { value: "100+", label: "Total Users", icon: Users },
          { value: "500+", label: "Exams Created", icon: FileCheck },
          { value: "5K+", label: "Total Questions", icon: Rocket },
        ]);
      }
    };

    fetchStats();
  }, []);
  return (
    <section className="relative h-[100dvh] w-[100dvw] overflow-hidden">
      {/* Unique background composition */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Large morphing gradient blob */}
      <div 
        className="absolute top-[-20%] right-[-10%] w-[70%] h-[80%] animate-morph"
        style={{
          background: 'linear-gradient(135deg, hsl(252 100% 69% / 0.12) 0%, hsl(252 60% 50% / 0.08) 100%)',
          filter: 'blur(80px)',
        }}
      />
      
      {/* Accent blob bottom left */}
      <div 
        className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] animate-morph"
        style={{
          background: 'linear-gradient(135deg, hsl(252 80% 60% / 0.08) 0%, hsl(240 30% 40% / 0.06) 100%)',
          filter: 'blur(80px)',
          animationDelay: '-4s',
        }}
      />

      {/* Geometric accent lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      
      {/* Floating geometric shapes */}
      <div className="absolute top-32 left-[15%] w-4 h-4 rotate-45 border-2 border-primary/20 animate-float" />
      <div className="absolute top-48 right-[20%] w-6 h-6 rounded-full border-2 border-primary/15 animate-float-delayed" />
      <div className="absolute bottom-48 left-[10%] w-3 h-3 bg-primary/20 rotate-45 animate-float-slow" />

      {/* Background text graphic - "Learn Smarter" */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-[20vw] font-black tracking-tighter leading-none text-foreground/[0.02] select-none">
          <div className="whitespace-nowrap">LEARN</div>
          <div className="whitespace-nowrap gradient-text opacity-[0.03]">SMARTER</div>
        </div>
      </div>

      <div className="container relative z-10 flex h-full flex-col items-center justify-center px-4">

        {/* Two-column horizontal layout */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left column - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] mb-6">
                <span className="block text-foreground animate-fadeInUp" style={{animationDelay: '0.1s', opacity: 0}}>Learn</span>
                <span className="block gradient-text animate-fadeInUp" style={{animationDelay: '0.2s', opacity: 0}}>Smarter</span>
                <span className="block text-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mt-2 text-muted-foreground animate-fadeInUp" style={{animationDelay: '0.3s', opacity: 0}}>
                  Not Harder
                </span>
              </h1>

              <p className="max-w-xl lg:max-w-none text-base md:text-lg text-muted-foreground leading-relaxed mb-8 animate-fadeInUp" style={{animationDelay: '0.4s', opacity: 0}}>
                Master any subject with AI-powered practice exams. Track your progress,
                identify weaknesses, and accelerate your learning journey.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row lg:flex-row items-center lg:items-start gap-4 animate-fadeInUp" style={{animationDelay: '0.5s', opacity: 0}}>
                <Link href="/signup">
                  <Button variant="hero" size="lg" className="group">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right column - Redesigned stat cards */}
            <div className="space-y-4 animate-fadeInUp" style={{animationDelay: '0.6s', opacity: 0}}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm p-5 hover:border-primary/30 transition-all duration-300 hover:translate-x-2"
                >
                  {/* Background icon */}
                  <div className="absolute right-0 top-0 w-24 h-24 -mr-6 -mt-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <stat.icon className="w-full h-full text-primary" strokeWidth={1} />
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <stat.icon className="h-8 w-8 text-primary flex-shrink-0" strokeWidth={2} />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</p>
                        <p className="text-2xl font-black text-foreground mt-0.5">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Unique bottom transition */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};
