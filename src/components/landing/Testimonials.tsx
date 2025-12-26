import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    avatar: "SC",
    content: "ScoreX transformed how I prepare for exams. The AI-generated questions are incredibly relevant and the instant feedback helps me understand concepts better.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Software Engineer",
    avatar: "MJ",
    content: "I use ScoreX to stay sharp on technical interviews. The variety of question formats and detailed explanations are exactly what I needed.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "High School Teacher",
    avatar: "ER",
    content: "As a teacher, I create custom exams for my students in minutes. The analytics help me identify where students struggle most. Game-changing!",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container relative z-10 px-4">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-sm font-bold tracking-widest text-primary uppercase">Testimonials</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            <span className="text-foreground">Loved by</span>
            <span className="gradient-text"> Learners</span>
          </h2>
          
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Join thousands transforming their learning experience
          </p>
        </div>
        
        {/* Testimonials with unique quote design */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className={`quote-card p-8 transition-all duration-500 hover:-translate-y-2 ${
                  index === 1 ? 'md:-translate-y-6' : ''
                }`}
              >
                {/* Stars with unified color */}
                <div className="flex gap-1 mb-6 relative z-10">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <div key={i} className="relative">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                    </div>
                  ))}
                </div>
                
                {/* Quote content */}
                <p className="text-foreground/90 leading-relaxed mb-8 relative z-10">
                  {testimonial.content}
                </p>
                
                {/* Author with unique avatar design */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    {/* Avatar glow */}
                    <div className="absolute inset-0 rounded-full bg-primary blur-md opacity-30" />
                    {/* Avatar */}
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm ring-2 ring-background">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};