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
          <div className="inline-flex items-center gap-3 mb-6 animate-fadeIn">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-sm font-bold tracking-widest text-primary uppercase">Features</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 animate-fadeInUp" style={{animationDelay: '0.1s', opacity: 0}}>
            <span className="text-foreground">Everything You Need</span>
            <br />
            <span className="gradient-text">To Excel</span>
          </h2>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground animate-fadeInUp" style={{animationDelay: '0.2s', opacity: 0}}>
            Powerful features designed to accelerate your learning journey
          </p>
        </div>
        
        {/* Unique bento-style grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`morphic-card group p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 relative overflow-hidden animate-scaleIn ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''
                }`}
                style={{animationDelay: `${0.3 + index * 0.1}s`, opacity: 0}}
              >
                {/* Premium background icon graphic */}
                <div className="absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                  <feature.icon className="w-full h-full text-primary" strokeWidth={1} />
                </div>

                {/* Decorative gradient orb */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl group-hover:scale-150 transition-transform duration-700" />

                {/* Number accent */}
                <div className="absolute bottom-6 left-6 text-8xl font-black text-primary/5 select-none group-hover:text-primary/10 transition-colors duration-500">
                  {feature.number}
                </div>

                {/* Icon - clean and simple */}
                <div className="relative mb-6 inline-flex">
                  <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-bold text-foreground mb-3 group-hover:gradient-text transition-all duration-300">
                  {feature.title}
                </h3>

                <p className="relative text-muted-foreground leading-relaxed">
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