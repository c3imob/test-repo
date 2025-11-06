"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { usePostStore } from "@/hooks/use-post-store";

type FormState = {
  title: string;
  keywords: string;
  tone: string;
  audience: string;
  length: "short" | "medium" | "long";
};

const defaultValues: FormState = {
  title: "How AI transforms content marketing",
  keywords: "AI, content marketing, automation",
  tone: "Thoughtful and optimistic",
  audience: "B2B marketing leaders",
  length: "medium"
};

export function GenerationForm() {
  const [form, setForm] = useState<FormState>(defaultValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setPost = usePostStore((state) => state.setPost);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to generate blog");
      }

      const data = await response.json();
      setPost({
        id: data.postId,
        title: form.title,
        introduction: data.introduction,
        body: data.body,
        conclusion: data.conclusion,
        keywords: form.keywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
        tone: form.tone,
        audience: form.audience,
        length: form.length,
        seo: data.seo
      });

      router.push(`/post/${data.postId}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-white">Craft your blog brief</h2>
        <p className="text-sm text-zinc-400">
          Provide a topic and a few preferences. Our AI will draft a structured article tailored for your audience.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-300">Blog title</span>
          <input
            required
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="e.g. The future of AI marketing"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-300">Keywords</span>
          <input
            value={form.keywords}
            onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="Comma separated"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-300">Tone of voice</span>
          <input
            required
            value={form.tone}
            onChange={(event) => setForm((prev) => ({ ...prev, tone: event.target.value }))}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="e.g. Conversational, authoritative"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-300">Target audience</span>
          <input
            required
            value={form.audience}
            onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value }))}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="e.g. SaaS marketers"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-300">Length</span>
          <select
            value={form.length}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, length: event.target.value as FormState["length"] }))
            }
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
          >
            <option value="short">Short (~500 words)</option>
            <option value="medium">Medium (~900 words)</option>
            <option value="long">Long (~1300 words)</option>
          </select>
        </label>
      </div>
      {error && <p className="rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      <button
        type="submit"
        className="btn-primary w-full justify-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Generating magic...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Generate blog with AI
          </>
        )}
      </button>
    </form>
  );
}
