"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, RefreshCw, Save, Wand2 } from "lucide-react";
import fileDownload from "js-file-download";
import jsPDF from "jspdf";

import { EditablePost, PostSection, usePostStore } from "@/hooks/use-post-store";
const sectionLabels: Record<PostSection, string> = {
  introduction: "Introduction",
  body: "Body",
  conclusion: "Conclusion"
};

type PostEditorProps = {
  initialPost: EditablePost;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function PostEditor({ initialPost }: PostEditorProps) {
  const { post, setPost, updateSection } = usePostStore();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<PostSection | null>(null);

  useEffect(() => {
    if (!post) {
      setPost(initialPost);
    }
  }, [initialPost, post, setPost]);

  const markdown = useMemo(() => {
    if (!post) return "";
    return `# ${post.title}\n\n${post.introduction}\n\n${post.body}\n\n## Conclusion\n\n${post.conclusion}`;
  }, [post]);

  const handleSectionChange = (section: PostSection, value: string) => {
    updateSection(section, value);
    setSaveState("idle");
  };

  const handleSave = async () => {
    if (!post?.id) return;
    setSaveState("saving");
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post)
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      setSaveState("saved");
      setMessage("Draft saved");
    } catch (error) {
      console.error(error);
      setSaveState("error");
      setMessage(error instanceof Error ? error.message : "Failed to save");
    }
  };

  useEffect(() => {
    if (!post?.id) return;
    const timeout = setTimeout(() => {
      void handleSave();
    }, 1500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.introduction, post?.body, post?.conclusion]);

  const handleRegenerate = async (section: PostSection) => {
    if (!post) return;
    setIsRegenerating(section);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          keywords: post.keywords.join(", "),
          tone: post.tone,
          audience: post.audience,
          length: post.length,
          section,
          postId: post.id
        })
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      updateSection(section, data[section]);
      setMessage(`${sectionLabels[section]} regenerated`);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to regenerate");
    } finally {
      setIsRegenerating(null);
    }
  };

  const exportMarkdown = () => {
    if (!post) return;
    fileDownload(markdown, `${post.title.replace(/\s+/g, "-").toLowerCase()}.md`);
  };

  const exportHtml = () => {
    if (!post) return;
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>${post.title}</title></head><body>${markdown
      .split("\n")
      .map((line) => `<p>${line}</p>`)
      .join("")}</body></html>`;
    fileDownload(html, `${post.title.replace(/\s+/g, "-").toLowerCase()}.html`);
  };

  const exportPdf = () => {
    if (!post) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text(post.title, 40, 60);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(`${post.introduction}\n\n${post.body}\n\n${post.conclusion}`, 500);
    doc.text(lines, 40, 100);
    doc.save(`${post.title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  const copyToClipboard = async () => {
    if (!post) return;
    await navigator.clipboard.writeText(markdown);
    setMessage("Copied to clipboard");
  };

  if (!post) {
    return null;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {(saveState === "saving" || isRegenerating) && (
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Saving changes...
          </p>
        )}
        {(["introduction", "body", "conclusion"] as PostSection[]).map((section) => (
          <section key={section} className="card space-y-3">
            <header className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{sectionLabels[section]}</h3>
              <button
                onClick={() => handleRegenerate(section)}
                disabled={isRegenerating === section}
                className="inline-flex items-center gap-2 rounded-md border border-brand/60 px-3 py-1 text-xs font-medium text-brand hover:bg-brand/10"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </button>
            </header>
            <textarea
              value={post[section]}
              onChange={(event) => handleSectionChange(section, event.target.value)}
              className="h-48 w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-3 text-sm text-white focus:border-brand focus:outline-none"
            />
          </section>
        ))}
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary inline-flex items-center gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" /> Save draft
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            onClick={exportMarkdown}
          >
            <Wand2 className="h-4 w-4" /> Export Markdown
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            onClick={exportHtml}
          >
            HTML
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            onClick={exportPdf}
          >
            PDF
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            onClick={copyToClipboard}
          >
            Copy
          </button>
        </div>
      </div>
      <aside className="space-y-6">
        <article className="card prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </article>
        {post.seo && (
          <section className="card space-y-4">
            <header>
              <h3 className="text-lg font-semibold text-white">SEO Analyzer</h3>
              <p className="text-sm text-zinc-400">Insights to improve your search visibility.</p>
            </header>
            <div>
              <h4 className="text-sm font-semibold text-zinc-300">Keyword density</h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                {Object.entries(post.seo.keywordDensity).map(([keyword, density]) => (
                  <li key={keyword} className="flex justify-between">
                    <span>{keyword}</span>
                    <span>{density.toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-brand/40 bg-brand/10 p-4">
              <p className="text-sm text-zinc-100">
                <strong>Meta title:</strong> {post.seo.metaTitle}
              </p>
              <p className="text-sm text-zinc-100">
                <strong>Meta description:</strong> {post.seo.metaDescription}
              </p>
              <p className="text-sm text-zinc-100">
                <strong>Readability:</strong> {post.seo.readability}
              </p>
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
