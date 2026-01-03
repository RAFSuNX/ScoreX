"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Bell, Palette, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const [profile, setProfile] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleProfileSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsSaving(false);
    }, 1000);
  };

  const handlePasswordChange = async () => {
    if (password.new !== password.confirm) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords don't match.",
      });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      setPassword({ current: "", new: "", confirm: "" });
      setIsSaving(false);
    }, 1000);
  };

  const currentPlan = session?.user?.plan || "FREE";

  const handlePlanDowngrade = async (plan: "FREE" | "PRO") => {
    setIsUpdatingPlan(true);
    try {
      const response = await fetch("/api/billing/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, action: "downgrade" }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "Unable to update plan");
      }

      await update();
      toast({
        title: "Plan updated",
        description: `Your plan is now ${plan}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Plan update failed",
        description:
          error instanceof Error ? error.message : "Unable to update plan",
      });
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="morphic-card p-6 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
          <User className="w-full h-full text-primary" strokeWidth={0.5} />
        </div>
        <div className="mb-6 relative">
          <h2 className="text-xl font-bold">Profile Information</h2>
          <p className="text-sm text-muted-foreground">Update your personal details</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2">
              <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="john@example.com" />
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <Button onClick={handleProfileSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="morphic-card p-6 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
          <Lock className="w-full h-full text-yellow-500" strokeWidth={0.5} />
        </div>
        <div className="mb-6 relative">
          <h2 className="text-xl font-bold">Change Password</h2>
          <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} placeholder="••••••••" />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} placeholder="••••••••" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} placeholder="••••••••" />
          </div>
          <Button onClick={handlePasswordChange} disabled={isSaving} variant="outline">
            <Lock className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </div>
      </div>

      <div className="morphic-card p-6 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
          <User className="w-full h-full text-primary" strokeWidth={0.5} />
        </div>
        <div className="mb-6 relative">
          <h2 className="text-xl font-bold">Subscription</h2>
          <p className="text-sm text-muted-foreground">
            Manage your current plan
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-lg font-semibold text-foreground">{currentPlan}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {currentPlan === "FREE" && (
              <>
                <Button
                  onClick={() => router.push("/billing/checkout?plan=PRO")}
                >
                  Upgrade to Pro
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/billing/checkout?plan=PREMIUM")}
                >
                  Upgrade to Premium
                </Button>
              </>
            )}

            {currentPlan === "PRO" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handlePlanDowngrade("FREE")}
                  disabled={isUpdatingPlan}
                >
                  {isUpdatingPlan ? "Updating..." : "Downgrade to Free"}
                </Button>
                <Button
                  onClick={() => router.push("/billing/checkout?plan=PREMIUM")}
                >
                  Upgrade to Premium
                </Button>
              </>
            )}

            {currentPlan === "PREMIUM" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handlePlanDowngrade("PRO")}
                  disabled={isUpdatingPlan}
                >
                  {isUpdatingPlan ? "Updating..." : "Downgrade to Pro"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePlanDowngrade("FREE")}
                  disabled={isUpdatingPlan}
                >
                  {isUpdatingPlan ? "Updating..." : "Downgrade to Free"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="morphic-card p-6 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
          <Bell className="w-full h-full text-green-500" strokeWidth={0.5} />
        </div>
        <div className="mb-6 relative">
          <h2 className="text-xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email updates about your exams</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Exam Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded about pending exams</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
        </div>
      </div>

      <div className="morphic-card p-6 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
          <Palette className="w-full h-full text-purple-500" strokeWidth={0.5} />
        </div>
        <div className="mb-6 relative">
          <h2 className="text-xl font-bold">Appearance</h2>
          <p className="text-sm text-muted-foreground">Customize your interface</p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline">Light Mode</Button>
          <Button variant="outline">Dark Mode</Button>
          <Button variant="outline">System</Button>
        </div>
      </div>
    </div>
  );
}
