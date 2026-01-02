"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Crown, Check, Zap } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  currentPlan?: "FREE" | "PRO" | "PREMIUM";
}

const UpgradeModal = ({
  isOpen,
  onClose,
  feature = "this feature",
  currentPlan = "FREE",
}: UpgradeModalProps) => {
  if (!isOpen) return null;

  const handleUpgrade = (plan: string) => {
    // TODO: Implement payment flow
    console.log(`Upgrading to ${plan}`);
    // For now, just redirect to pricing page
    window.location.href = "/pricing";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-card/90 border border-border/50 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Upgrade Your Plan</h2>
            <p className="text-muted-foreground">
              Unlock {feature} and more powerful features
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pro Plan */}
          <div className="relative p-6 rounded-2xl border-2 border-primary bg-primary/5">
            <div className="absolute -top-3 left-6">
              <Badge className="bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">Pro</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>50 exams</strong> per month
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Up to <strong>50 questions</strong> per exam
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>PDF uploads</strong> up to 20 pages
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Fill-in-the-Blank</strong> & Short Answer questions
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Question Bank</strong> - Save up to 500 questions
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Manual question editing</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Flashcard study mode</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Advanced analytics</strong> & performance tracking
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>PDF export</strong> of results
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    No watermarks
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleUpgrade("PRO")}
                className="w-full mt-6"
                disabled={currentPlan === "PRO" || currentPlan === "PREMIUM"}
              >
                {currentPlan === "PRO" ? "Current Plan" : "Upgrade to Pro"}
              </Button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="relative p-6 rounded-2xl border-2 border-muted bg-muted/5">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-2xl font-bold text-foreground">Premium</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$79</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Everything in Pro</strong>, plus:
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Unlimited</strong> exams and questions
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Large PDF uploads</strong> (100+ pages)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Unlimited</strong> Question Bank storage
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Team collaboration</strong> & shared workspaces
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Student management</strong> & progress tracking
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>Custom branding</strong> options
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <strong>LMS integrations</strong> (Canvas, Moodle)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Priority support
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleUpgrade("PREMIUM")}
                variant="outline"
                className="w-full mt-6"
                disabled={currentPlan === "PREMIUM"}
              >
                {currentPlan === "PREMIUM" ? "Current Plan" : "Upgrade to Premium"}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include full access to gamification features, leaderboards, and advanced analytics.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
