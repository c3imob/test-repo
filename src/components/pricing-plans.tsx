"use client"

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  description: string;
  benefits: string[];
  priceId: string | null;
};

type Props = {
  userId: string | null;
  isPro?: boolean;
  proPriceId?: string;
};

export function PricingPlans({ userId, isPro, proPriceId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const plans: Plan[] = useMemo(() => [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying AI BlogCraft",
      benefits: [
        "5 blog generations per month",
        "Regenerate sections",
        "SEO analyzer"
      ],
      priceId: null
    },
    {
      name: "Pro",
      price: "$39",
      description: "Unlimited content for growing teams",
      benefits: [
        "Unlimited generations",
        "Priority AI models",
        "Advanced export templates",
        "Team collaboration (coming soon)"
      ],
      priceId: proPriceId ?? null
    }
  ], [proPriceId]);

  const handleCheckout = async (priceId: string | null) => {
    if (!priceId) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId })
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="space-y-3 text-center">
        <h1 className="text-4xl font-semibold text-white">Choose the right plan</h1>
        <p className="text-sm text-zinc-400">Upgrade to Pro for unlimited generations and premium export options.</p>
      </header>
      {message && <p className="text-center text-sm text-red-400">{message}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.name} className="card space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
              <p className="text-lg text-brand">{plan.price} / month</p>
              <p className="text-sm text-zinc-400">{plan.description}</p>
            </div>
            <ul className="space-y-2 text-sm text-zinc-300">
              {plan.benefits.map((benefit) => (
                <li key={benefit}>• {benefit}</li>
              ))}
            </ul>
            {plan.name === "Free" ? (
              <button className="w-full rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200" disabled>
                Current plan
              </button>
            ) : (
              <button
                className="btn-primary w-full justify-center"
                disabled={loading || isPro}
                onClick={() => handleCheckout(plan.priceId)}
              >
                {isPro ? "You are Pro" : loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upgrade to Pro"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
