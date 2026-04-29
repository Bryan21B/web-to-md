import type { ExtractedArticle } from "./extract";

export type Frontmatter = Record<string, string>;

export function buildFrontmatter(extracted: ExtractedArticle): Frontmatter {
  const createdAt = new Date().toISOString();
  const out: Frontmatter = {
    source_url: extracted.sourceUrl,
    created_at: createdAt,
  };

  if (extracted.title) out.title = extracted.title;
  if (extracted.author) out.author = extracted.author;

  return out;
}

export function combineFrontmatterAndBody(frontmatter: Frontmatter | null, bodyMarkdown: string): string {
  const body = bodyMarkdown.trim() + "\n";
  if (!frontmatter) return body;

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${yamlEscape(value)}`)
    .join("\n");

  return `---\n${yaml}\n---\n\n${body}`;
}

function yamlEscape(value: string): string {
  // Minimal YAML scalar escaping; keep it predictable for filenames/urls/titles.
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}
