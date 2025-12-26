import { Button } from "@/components/ui/button";
import { Zap, Users, FileCheck, Rocket, ArrowRight } from "lucide-react";

const stats = [
  { value: "10K+", label: "Students", icon: Users },
  { value: "50K+", label: "Exams Created", icon: FileCheck },
  { value: "95%", label: "Success Rate", icon: Rocket },
];

export const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
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

      <div className="container relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-24">

        {/* Main headline - asymmetric layout */}
        <div className="max-w-5xl text-center mb-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            <span className="block text-foreground">Learn</span>
            <span className="block gradient-text">Smarter</span>
            <span className="block text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mt-2 text-muted-foreground">
              Not Harder
            </span>
          </h1>
          
          <p className="mx-auto max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            AI-generated exams that adapt to you. Track progress. Master subjects.
            The future of learning is personal.
          </p>
        </div>

        {/* CTAs with unique styling */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Button variant="hero" size="lg" className="group">
            Start Learning Free
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button variant="hero-outline" size="lg">
            Watch Demo
          </Button>
        </div>

        {/* Unique stat cards - asymmetric grid */}
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`stat-card p-6 sm:p-8 ${
                  index === 1 ? 'sm:-translate-y-4' : ''
                } ${
                  index === 0 ? 'animate-float' : 
                  index === 1 ? 'animate-float-delayed' : 
                  'animate-float-slow'
                }`}
              >
                {/* Icon with unique treatment */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg" />
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="number-badge mb-1">{stat.value}</div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unique bottom transition */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};