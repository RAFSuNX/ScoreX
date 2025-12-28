"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Eye, EyeOff, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup" | "forgot";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode: initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabel = passwordStrength <= 1 ? "Weak" : passwordStrength <= 2 ? "Medium" : "Strong";
  const strengthColor = passwordStrength <= 1 ? "bg-red-500" : passwordStrength <= 2 ? "bg-yellow-500" : "bg-green-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: "Passwords don't match" });
          toast({
            variant: "destructive",
            title: "Password mismatch",
            description: "Please make sure both passwords match.",
          });
          return;
        }

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          const description = data.message || "We couldn't create that account.";
          setErrors({ form: description });
          toast({
            variant: "destructive",
            title: "Signup failed",
            description,
          });
          return;
        }

        toast({
          title: "Account created!",
          description: "Signing you in...",
        });

        try {
          const signInResult = await signIn('credentials', {
            redirect: false,
            email: formData.email,
            password: formData.password,
          });

          if (signInResult?.ok) {
            toast({
              title: "Welcome to ScoreX!",
              description: "You're all set.",
            });
            router.push('/dashboard');
            return;
          }

          const signInError =
            signInResult?.error === "CredentialsSignin"
              ? "We created your account, but automatic sign-in failed. Please log in manually."
              : signInResult?.error || "We couldn't sign you in automatically.";

          setErrors({ form: signInError });
          toast({
            variant: "destructive",
            title: "Automatic login failed",
            description: signInError,
          });
        } catch (error) {
          const description =
            error instanceof Error
              ? error.message
              : "We created your account, but automatic sign-in failed. Please try logging in manually.";
          setErrors({ form: description });
          toast({
            variant: "destructive",
            title: "Automatic login failed",
            description,
          });
        }
      } else if (mode === "login") {
        try {
          const result = await signIn('credentials', {
            redirect: false,
            email: formData.email,
            password: formData.password,
          });

          if (result?.error) {
            const description =
              result.error === "CredentialsSignin"
                ? "Invalid email or password."
                : result.error;
            setErrors({ form: description });
            toast({
              variant: "destructive",
              title: "Login failed",
              description,
            });
          } else if (result?.ok) {
            toast({
              title: "Welcome back!",
              description: "Successfully signed in.",
            });
            router.push('/dashboard');
          }
        } catch (error) {
          const description =
            error instanceof Error
              ? error.message
              : "We couldn't reach the server. Please try again.";
          setErrors({ form: description });
          toast({
            variant: "destructive",
            title: "Login failed",
            description,
          });
        }
      }
      // Handle 'forgot' mode if necessary
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 animate-pulse" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 w-full max-w-md">
          <div className="backdrop-blur-xl bg-glass border border-glass-border rounded-3xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We&rsquo;ve sent a password reset link to <strong>{formData.email}</strong>
            </p>
            <Button
              onClick={() => { setMode("login"); setEmailSent(false); }}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Benefits */}
        <div className="hidden lg:block space-y-8 p-8">
          <div className="flex items-center">
            <span className="text-3xl font-black tracking-tight">
              Score<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">X</span>
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-foreground">
              {mode === "login" ? "Welcome Back!" : mode === "signup" ? "Join the Future of Learning" : "Reset Your Password"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {mode === "login"
                ? "Continue your personalized learning journey with AI-powered exams."
                : mode === "signup"
                ? "Experience personalized education powered by artificial intelligence."
                : "Don&rsquo;t worry, it happens to the best of us."}
            </p>
          </div>

          {/* Testimonial */}
          <div className="backdrop-blur-xl bg-glass border border-glass-border rounded-2xl p-6">
            <p className="text-foreground italic mb-4">
              &ldquo;ScoreX transformed how I study. The AI-generated exams are spot-on!&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary" />
              <div>
                <p className="font-semibold text-foreground">Sarah Chen</p>
                <p className="text-sm text-muted-foreground">Computer Science Student</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="backdrop-blur-xl bg-glass border border-glass-border rounded-3xl p-8 shadow-2xl">
            {/* Logo (mobile) */}
            <div className="flex lg:hidden items-center justify-center mb-6">
              <span className="text-2xl font-black">
                Score<span className="gradient-text">X</span>
              </span>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {mode === "login" ? "Welcome Back" : mode === "signup" ? "Start Learning Today" : "Reset Password"}
              </h2>
              <p className="text-muted-foreground">
                {mode === "login" ? "Continue your learning journey" : mode === "signup" ? "Join thousands of successful learners" : "Enter your email"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {mode === "signup" && formData.password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${i < passwordStrength ? strengthColor : "bg-muted"}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{strengthLabel}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password - Only for Signup */}
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {errors.form && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{errors.form}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? "Loading..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
              </Button>

              {/* Links */}
              <div className="text-center text-sm">
                {mode === "login" ? (
                  <p className="text-muted-foreground">
                    Don&rsquo;t have an account?{" "}
                    <button type="button" onClick={() => router.push("/signup")} className="text-primary font-medium hover:underline">
                      Sign up
                    </button>
                  </p>
                ) : mode === "signup" ? (
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <button type="button" onClick={() => router.push("/login")} className="text-primary font-medium hover:underline">
                      Log in
                    </button>
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
