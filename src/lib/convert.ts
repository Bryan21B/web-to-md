import { extractArticleMarkdown, extractFallbackMarkdown } from "./extract";
import { buildFrontmatter, combineFrontmatterAndBody } from "./frontmatter";
import { saveMarkdownToFile } from "./save";
import type { CommandPreferences } from "./types";

export type ConvertPreferences = CommandPreferences;

export async function convertWebpageToMarkdown(options: {
  url: string;
  preferences: ConvertPreferences;
  onProgress?: (message: string) => void;
}): Promise<{ markdown: string; outputPath: string }> {
  const { url, preferences, onProgress } = options;

  onProgress?.("Extracting main content…");
  let extracted = await extractArticleMarkdown(url);

  if (!extracted || extracted.bodyMarkdown.trim().length < 200) {
    if (preferences.externalFallbackEnabled && preferences.externalFallbackPrefix?.trim()) {
      onProgress?.("Local extraction failed; using external fallback…");
      extracted = await extractFallbackMarkdown(url, preferences.externalFallbackPrefix.trim());
    }
  }

  if (!extracted || extracted.bodyMarkdown.trim().length < 50) {
    throw new Error("Could not extract meaningful article content from the page.");
  }

  const frontmatter = preferences.includeFrontmatter ? buildFrontmatter(extracted) : null;
  const markdown = combineFrontmatterAndBody(frontmatter, extracted.bodyMarkdown);

  onProgress?.("Saving file…");
  const outputPath = await saveMarkdownToFile({
    title: extracted.title,
    markdown,
    url,
    preferences,
  });

  return { markdown, outputPath };
}
