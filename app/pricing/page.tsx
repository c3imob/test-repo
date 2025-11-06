import { PricingPlans } from "@/components/pricing-plans";
import { getServerAuthSession } from "@/lib/auth";

export default async function PricingPage() {
  const session = await getServerAuthSession();
  const userId = session?.user?.id ?? null;
  const proPriceId = process.env.STRIPE_PRICE_PRO ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "";

  return <PricingPlans userId={userId} isPro={session?.user?.role === "PRO"} proPriceId={proPriceId} />;
}
