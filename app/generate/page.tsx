import { redirect } from "next/navigation";

import { GenerationForm } from "@/components/generation-form";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FREE_GENERATION_LIMIT } from "@/lib/auth";

export default async function GeneratePage() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const now = new Date();
  const usage = await prisma.usage.findUnique({
    where: {
      userId_month_year: {
        userId: session.user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }
    }
  });

  const remaining = session.user.role === "PRO" ? "Unlimited" : Math.max(FREE_GENERATION_LIMIT - (usage?.count ?? 0), 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <GenerationForm />
      <aside className="space-y-6">
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-white">Usage overview</h2>
          <p className="text-sm text-zinc-400">
            {session.user.role === "PRO"
              ? "You are on the Pro plan with unlimited generations."
              : `You are on the Free plan. ${remaining} generations left this month.`}
          </p>
          {session.user.role !== "PRO" && (
            <div>
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.min(((usage?.count ?? 0) / FREE_GENERATION_LIMIT) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500">
                {usage?.count ?? 0} of {FREE_GENERATION_LIMIT} generations used this month.
              </p>
            </div>
          )}
        </section>
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-white">Tips for better outputs</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-400">
            <li>Describe the tone and format you want. Mention persona insights to tailor messaging.</li>
            <li>Add 3–5 keywords so the SEO analyzer can provide accurate density metrics.</li>
            <li>Use the regenerate buttons in the editor to iterate on specific sections quickly.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
