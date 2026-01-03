"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

type CheckoutStatus = "idle" | "loading" | "success" | "error";

interface CheckoutClientProps {
  plan: "PRO" | "PREMIUM";
  priceLabel: string;
}

const CheckoutClient = ({ plan, priceLabel }: CheckoutClientProps) => {
  const router = useRouter();
  const { update } = useSession();
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/billing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, status: "confirmed" }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "Payment confirmation failed");
      }

      await update();
      setStatus("success");
      router.push("/dashboard");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Payment confirmation failed"
      );
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border border-border bg-muted/30 p-5">
        <div className="text-sm text-muted-foreground">Selected plan</div>
        <div className="text-2xl font-semibold text-foreground">
          {plan} <span className="text-base text-muted-foreground">{priceLabel}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          This is a simulated checkout. Clicking confirm will activate your plan.
        </p>
      </div>

      {status === "error" && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleConfirm}
          className="w-full sm:w-auto"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Confirming..." : "Confirm payment"}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.back()}
          disabled={status === "loading"}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CheckoutClient;
