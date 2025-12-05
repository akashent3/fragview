/**
 * Parse review text and convert mentions to clickable links
 * Supports:
 * - @username → /u/username
 * - #[Perfume Name](slug) → /perfumes/slug
 */

export function parseReviewMentions(text: string): string {
  if (!text) return '';

  let parsed = text;

  // 1. Parse perfume mentions: #[Perfume Name](slug)
  parsed = parsed.replace( /#\[([^\]]+)\]\(([^)]+)\)/g, '<a href="/perfumes/$2" class="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors" target="_blank">#$1</a>');

  // 2. Parse user mentions: @username (only standalone words)
  // ✅ FIXED: Removed space in (?:^|\s)
  parsed = parsed.replace( /(^|\s)@(\w+)/g, '$1<a href="/u/$2" class="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors" target="_blank">@$2</a>');

  // 3. Convert line breaks to <br>
  parsed = parsed.replace(/\n/g, '<br>');

  return parsed;
}