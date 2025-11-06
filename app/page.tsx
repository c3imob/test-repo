import Link from "next/link";

import { Features } from "@/components/site-features";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-8 rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/20 via-zinc-900 to-zinc-950 p-12 text-center shadow-2xl shadow-brand/20">
        <div className="mx-auto max-w-3xl space-y-6">
          <span className="rounded-full border border-brand/50 bg-brand/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            AI BlogCraft
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Publish high-impact blogs in minutes – not weeks.
          </h1>
          <p className="text-lg text-zinc-300">
            AI BlogCraft combines GPT-powered writing with an editor built for marketers. Generate tailored outlines, refine sections inline, and export to your CMS without leaving the app.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <Link href="/generate" className="btn-primary text-base">
            Start generating for free
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-6 py-2 text-base font-medium text-zinc-200 transition hover:bg-zinc-800"
          >
            Explore pricing
          </Link>
        </div>
        <dl className="grid gap-6 text-sm text-zinc-300 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4">
            <dt className="font-medium text-white">SEO-ready structure</dt>
            <dd>Auto-generated headings, keyword density analysis, and meta tags.</dd>
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4">
            <dt className="font-medium text-white">Regenerate any section</dt>
            <dd>Iterate quickly with targeted rewrites of intro, body, or conclusion.</dd>
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4">
            <dt className="font-medium text-white">Powerful exports</dt>
            <dd>Send to Markdown, HTML, PDF, or your clipboard with one click.</dd>
          </div>
        </dl>
      </section>
      <Features />
    </div>
  );
}
