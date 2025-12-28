"use client";

import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    icon: Zap,
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "5 AI exams/month",
      "Basic analytics",
      "Learning streaks",
      "Community support",
    ],
    buttonText: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    icon: Sparkles,
    price: "$9",
    period: "month",
    description: "For serious learners",
    features: [
      "50 AI exams/month",
      "Advanced analytics",
      "Priority AI grading",
      "Custom subjects",
      "Email support",
    ],
    buttonText: "Choose Pro",
    featured: true,
  },
  {
    name: "Premium",
    icon: Crown,
    price: "$19",
    period: "month",
    description: "For power users",
    features: [
      "Unlimited exams",
      "AI tutoring sessions",
      "Export reports",
      "Team collaboration",
      "Priority support",
      "Custom branding",
    ],
    buttonText: "Choose Premium",
    featured: false,
  },
];

export const Pricing = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container relative z-10 px-4">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6 animate-fadeIn">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-sm font-bold tracking-widest text-primary uppercase">Pricing</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 animate-fadeInUp" style={{animationDelay: '0.1s', opacity: 0}}>
            <span className="text-foreground">Simple</span>
            <span className="gradient-text"> Pricing</span>
          </h2>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground animate-fadeInUp" style={{animationDelay: '0.2s', opacity: 0}}>
            Choose the plan that fits your learning journey. No hidden fees.
          </p>
        </div>
        
        {/* Pricing cards with unique layout */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`${tier.featured ? 'tier-card-featured lg:-translate-y-6' : 'tier-card'} p-8 flex flex-col relative animate-scaleIn`}
                style={{animationDelay: `${0.3 + index * 0.15}s`, opacity: 0}}
              >
                {/* Featured badge */}
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="glow-pill !py-1.5 !px-4">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-xs font-bold text-primary">MOST POPULAR</span>
                    </div>
                  </div>
                )}
                
                {/* Premium background icon graphic */}
                <div className="absolute top-0 right-0 w-40 h-40 -mr-10 -mt-10 opacity-[0.02]">
                  <tier.icon className="w-full h-full text-primary" strokeWidth={0.5} />
                </div>

                {/* Tier icon with premium treatment */}
                <div className="relative mb-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl transition-all ${
                    tier.featured
                      ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20'
                      : 'bg-gradient-to-br from-muted to-muted/50'
                  }`}>
                    <tier.icon className={`h-6 w-6 ${tier.featured ? 'text-primary-foreground' : 'text-foreground'}`} strokeWidth={2} />
                  </div>
                </div>
                
                {/* Tier info */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {tier.description}
                  </p>
                </div>
                
                {/* Price with unique styling */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black ${tier.featured ? 'gradient-text' : 'text-foreground'}`}>
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                </div>
                
                {/* Features with custom checkmarks */}
                <ul className="mb-8 flex-1 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                        tier.featured 
                          ? 'bg-primary' 
                          : 'bg-muted'
                      }`}>
                        <Check className={`h-3 w-3 ${tier.featured ? 'text-primary-foreground' : 'text-foreground'}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Link href="/signup" className="w-full">
                  <Button
                    variant={tier.featured ? "hero" : "glass"}
                    className="w-full"
                    size="lg"
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};