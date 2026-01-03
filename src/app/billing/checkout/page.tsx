import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import CheckoutClient from "./CheckoutClient";

const PLAN_PRICE: Record<"PRO" | "PREMIUM", string> = {
  PRO: "$19 / month",
  PREMIUM: "$79 / month",
};

interface CheckoutPageProps {
  searchParams?: { plan?: string };
}

const CheckoutPage = async ({ searchParams }: CheckoutPageProps) => {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const selected =
    searchParams?.plan && searchParams.plan.toUpperCase() === "PREMIUM"
      ? "PREMIUM"
      : "PRO";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Complete your upgrade
        </h1>
        <p className="text-muted-foreground">
          Review your plan and confirm payment to activate premium features.
        </p>
      </div>

      <CheckoutClient plan={selected} priceLabel={PLAN_PRICE[selected]} />
    </div>
  );
};

export default CheckoutPage;
