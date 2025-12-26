import { Brain, CheckCircle, Flame, BarChart3, Layers, Trophy } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Exam Generation",
    description: "Upload PDFs or describe topics, AI creates custom exams tailored to your learning needs.",
    number: "01",
  },
  {
    icon: CheckCircle,
    title: "Smart Grading",
    description: "Get instant feedback and detailed explanations to understand your mistakes.",
    number: "02",
  },
  {
    icon: Flame,
    title: "Learning Streaks",
    description: "Build habits with daily streak tracking and stay motivated on your journey.",
    number: "03",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Visualize your progress with beautiful charts and actionable insights.",
    number: "04",
  },
  {
    icon: Layers,
    title: "Multi-format Questions",
    description: "Multiple choice, true/false, and short answer questions for comprehensive testing.",
    number: "05",
  },
  {
    icon: Trophy,
    title: "Subject Mastery",
    description: "Track performance across different subjects and celebrate your achievements.",
    number: "06",
  },
];

export const Features = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container relative z-10 px-4">
        {/* Section header with unique design */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-sm font-bold tracking-widest text-primary uppercase">Features</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            <span className="text-foreground">Everything You Need</span>
            <br />
            <span className="gradient-text">To Excel</span>
          </h2>
          
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Powerful features designed to accelerate your learning journey
          </p>
        </div>
        
        {/* Unique bento-style grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`morphic-card group p-8 transition-all duration-500 hover:-translate-y-2 ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''
                }`}
              >
                {/* Number accent */}
                <div className="absolute top-6 right-6 text-7xl font-black text-foreground/[0.03] select-none">
                  {feature.number}
                </div>
                
                {/* Icon with unique orb design */}
                <div className="icon-orb mb-6">
                  <div className="icon-orb-inner" style={{
                    boxShadow: `inset 0 0 30px hsl(var(--primary) / 0.1)`
                  }}>
                    <div className="p-3 rounded-full bg-primary/20">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:gradient-text transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover line accent */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};