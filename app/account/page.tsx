import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id }
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Account & Billing</h1>
        <p className="text-sm text-zinc-400">Manage your plan, billing details, and usage preferences.</p>
      </header>
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">Current plan</h2>
        <p className="text-sm text-zinc-400">{session.user.role === "PRO" ? "Pro" : "Free"} plan</p>
        {subscription ? (
          <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-4 text-sm text-zinc-300">
            <p>Status: {subscription.status}</p>
            {subscription.currentPeriodEnd && (
              <p>Renews on: {subscription.currentPeriodEnd.toLocaleDateString()}</p>
            )}
            <p>Stripe customer ID: {subscription.stripeCustomerId}</p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            No active subscription. Upgrade on the pricing page to unlock unlimited generations.
          </p>
        )}
      </section>
    </div>
  );
}
