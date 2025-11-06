export type BlogGenerationPayload = {
  title: string;
  keywords?: string;
  tone: string;
  audience: string;
  length: "short" | "medium" | "long";
};

export type BlogSection = "introduction" | "body" | "conclusion";

export type GeneratedBlog = {
  introduction: string;
  body: string;
  conclusion: string;
  seo: {
    keywordDensity: Record<string, number>;
    metaTitle: string;
    metaDescription: string;
    readability: string;
  };
};

const lengthToWordCount: Record<BlogGenerationPayload["length"], number> = {
  short: 500,
  medium: 900,
  long: 1300
};

export const generateBlog = async (
  payload: BlogGenerationPayload
): Promise<GeneratedBlog> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  const prompt = `You are an expert SaaS content marketer. Write a blog post with an engaging introduction, rich body with descriptive sub-headings, and a concise conclusion.\n\n` +
    `Title: ${payload.title}\n` +
    `Keywords: ${payload.keywords || ""}\n` +
    `Tone: ${payload.tone}\n` +
    `Audience: ${payload.audience}\n` +
    `Length: ${lengthToWordCount[payload.length]} words (approx).\n` +
    `Respond in JSON with the keys introduction, body, conclusion, seo. The seo object should contain keywordDensity (record of keyword to percentage), metaTitle, metaDescription and readability.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: "You create publication-ready marketing blog posts." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI did not return any content");
  }

  const parsed = JSON.parse(content);

  return {
    introduction: parsed.introduction,
    body: parsed.body,
    conclusion: parsed.conclusion,
    seo: parsed.seo
  };
};

export const regenerateSection = async (
  section: BlogSection,
  payload: BlogGenerationPayload & {
    currentContent: string;
    otherSections?: Record<string, string>;
  }
): Promise<string> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  const prompt = `You are updating the ${section} of a blog post titled "${payload.title}".\n` +
    `Tone: ${payload.tone}. Audience: ${payload.audience}.\n` +
    `Keywords: ${payload.keywords || ""}.\n` +
    (payload.otherSections ? `Other sections for context: ${JSON.stringify(payload.otherSections)}\n` : "") +
    `Rewrite only the ${section} with engaging copy. Provide markdown with headings where relevant. Respond with plain text for the ${section}.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an elite SaaS content editor." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI section request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI did not return section content");
  }

  return content.trim();
};
