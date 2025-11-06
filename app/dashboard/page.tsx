import { redirect } from "next/navigation";
import { PostTable } from "@/components/dashboard/post-table";
import { FREE_GENERATION_LIMIT, getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" }
  });

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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Your content hub</h1>
          <p className="text-sm text-zinc-400">Access drafts, see generation history, and pick up where you left off.</p>
        </div>
      </header>
      {session.user.role !== "PRO" && (
        <section className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Monthly usage</h2>
            <p className="text-sm text-zinc-400">
              {usage?.count ?? 0} of {FREE_GENERATION_LIMIT} free generations used this month.
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 md:w-64">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.min(((usage?.count ?? 0) / FREE_GENERATION_LIMIT) * 100, 100)}%` }}
            />
          </div>
        </section>
      )}
      <PostTable
        posts={posts.map((post) => ({
          id: post.id,
          title: post.title,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          tone: post.tone,
          audience: post.audience
        }))}
      />
    </div>
  );
}
