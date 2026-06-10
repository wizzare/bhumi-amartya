/**
 * Utility to clean markdown artifacts from strings for a cleaner UI display.
 * Used for AI-generated content that might contain raw markdown syntax.
 */
export function cleanMarkdown(text?: string | null): string {
  if (!text) return "";

  return text
    // Remove bold/italic markers
    .replace(/\*\*\*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/___/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    // Remove headers
    .replace(/^#+\s+/gm, "")
    // Remove bullet points/list markers
    .replace(/^\s*[-*+]\s+/gm, "")
    // Remove numbered list markers (e.g., "1. ")
    .replace(/^\s*\d+\.\s+/gm, "")
    // Remove blockquote markers
    .replace(/^>\s+/gm, "")
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`.*?`/g, "")
    // Normalize line breaks
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
