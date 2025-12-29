import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is already logged in
  const session = await getAuthSession();

  // If user is authenticated, redirect to dashboard
  if (session && session.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <section id="features">
        <Features />
      </section>
      <section id="pricing">
        <Pricing />
      </section>
      <section id="testimonials">
        <Testimonials />
      </section>
      <Footer />
    </main>
  );
}
