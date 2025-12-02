/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate read time from content
 */
export function calculateReadTime(content: string): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200); // Average reading speed: 200 words/min
  return `${minutes} min read`;
}