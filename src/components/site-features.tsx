import { Brain, Edit3, LineChart, Sparkles, Upload, Zap } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI writing engine",
    description: "Leverage GPT-4 level models tuned for marketing copy to draft on-brand stories."
  },
  {
    icon: Edit3,
    title: "Inline editor",
    description: "Update copy inline with instant previews and regenerate any section in seconds."
  },
  {
    icon: LineChart,
    title: "SEO intelligence",
    description: "Keyword density, readability, and metadata suggestions delivered with every draft."
  },
  {
    icon: Upload,
    title: "One-click exports",
    description: "Ship to Markdown, HTML, PDF, or copy-ready text for your CMS workflows."
  },
  {
    icon: Brain,
    title: "Audience-aware",
    description: "Guide tone and structure for different personas without writing lengthy briefs."
  },
  {
    icon: Zap,
    title: "Usage analytics",
    description: "Track how many generations remain in your plan directly from the dashboard."
  }
];

export function Features() {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {features.map((feature) => (
        <article key={feature.title} className="card h-full space-y-3">
          <feature.icon className="h-6 w-6 text-brand" />
          <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
