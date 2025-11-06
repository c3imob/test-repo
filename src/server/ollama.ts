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
  seo?: {
    keywordDensity: Record<string, number>;
    metaTitle: string;
    metaDescription: string;
    readability: string;
  };
};

const lengthToWordCount: Record<BlogGenerationPayload["length"], number> = {
  short: 500,
  medium: 900,
  long: 1300,
};

export const generateBlog = async (
  payload: BlogGenerationPayload
): Promise<GeneratedBlog> => {
  const prompt =
    `You are an expert SaaS content marketer. Write a blog post with an engaging introduction, rich body with descriptive sub-headings, and a concise conclusion.` +
    `\nTitle: ${payload.title}` +
    `\nKeywords: ${payload.keywords || ""}` +
    `\nTone: ${payload.tone}` +
    `\nAudience: ${payload.audience}` +
    `\nLength: ${lengthToWordCount[payload.length]} words (approx).` +
    `\n\nRespond with a JSON object containing the keys introduction, body, conclusion, seo. All of them must be strings.` +
    `\nThe seo object must contain metaTitle, metaDescription, readability all of them must be strings, and keywordDensity (record of keyword to percentage), .` +
    `\nReturn valid JSON only. Do not wrap the JSON in markdown code fences or add commentary.`;

  console.info("prompt\n\n\n", prompt);
  const content = await callOllama([
    {
      role: "system",
      content: "You create publication-ready marketing blog posts.",
    },
    { role: "user", content: prompt },
  ]);

  const parsed = parseJsonFromContent(content) as Partial<GeneratedBlog>;

  console.info("parsed", parsed);

  if (
    !parsed ||
    typeof parsed.introduction !== "string" ||
    typeof parsed.body !== "string" ||
    typeof parsed.conclusion !== "string" ||
    !parsed.seo ||
    typeof parsed.seo.metaTitle !== "string" ||
    typeof parsed.seo.metaDescription !== "string" ||
    typeof parsed.seo.readability !== "string" ||
    typeof parsed.seo.keywordDensity !== "object"
  ) {
    return {
      introduction: "Ollama returned an invalid blog structure",
      body: content,
      conclusion: "",
    };
    // throw new Error("Ollama returned an invalid blog structure");
  }

  return {
    introduction: parsed.introduction,
    body: parsed.body,
    conclusion: parsed.conclusion,
    seo: parsed.seo,
  };
};

export const regenerateSection = async (
  section: BlogSection,
  payload: BlogGenerationPayload & {
    currentContent: string;
    otherSections?: Record<string, string>;
  }
): Promise<string> => {
  const prompt =
    `You are updating the ${section} of a blog post titled "${payload.title}".\n` +
    `Tone: ${payload.tone}. Audience: ${payload.audience}.\n` +
    `Keywords: ${payload.keywords || ""}.\n` +
    (payload.otherSections
      ? `Other sections for context: ${JSON.stringify(payload.otherSections)}\n`
      : "") +
    `Rewrite only the ${section} with engaging copy. Provide markdown with headings where relevant.` +
    `\nRespond with the updated ${section} only. Do not include code fences.`;

  const content = await callOllama([
    { role: "system", content: "You are an elite SaaS content editor." },
    { role: "user", content: prompt },
  ]);

  return stripCodeFences(content).trim();
};

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const getOllamaConfig = () => {
  const baseUrl = (
    process.env.OLLAMA_BASE_URL || "http://localhost:11434"
  ).replace(/\/+$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.1:8b-instruct-q4_K_M";

  return { baseUrl, model };
};

const callOllama = async (messages: ChatMessage[]): Promise<string> => {
  const { baseUrl, model } = getOllamaConfig();

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    message?: { content?: string };
    error?: string;
  };

  if (data.error) {
    throw new Error(`Ollama error: ${data.error}`);
  }

  const content = data.message?.content;
  if (!content) {
    throw new Error("Ollama did not return any content");
  }

  return content;
};

const stripCodeFences = (text: string): string => {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:[\w-]+)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return trimmed;
};

const parseJsonFromContent = (text: string): unknown => {
  const sanitized = stripCodeFences(text);
  try {
    return JSON.parse(sanitized);
  } catch {
    const start = sanitized.indexOf("{");
    const end = sanitized.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(sanitized.slice(start, end + 1));
      } catch (error) {
        throw new Error(
          `Unable to parse JSON from Ollama response: ${
            (error as Error).message
          }`
        );
      }
    }
    throw new Error("Ollama response did not contain parseable JSON");
  }
};
