import noteMap from '@/data/note-images.json';

function slugifyBase(name: string) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]+/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
}

/**
 * Resolve a note icon URL.
 * Priority:
 * 1) Exact match in blob map
 * 2) Partial match: any token inside the note name (e.g., "hazelnut praline" -> "hazelnut")
 * 3) Local fallback paths under /notes (if you kept local copies)
 * 4) undefined (caller may render a placeholder)
 */
export function getNoteImageUrl(noteName: string): string | undefined {
  const slug = slugifyBase(noteName);
  const map = noteMap as Record<string, string>;

  // 1) Exact match
  if (map[slug]) return map[slug];

  // 2) Partial token match (e.g., hazelnut-praline => hazelnut)
  const parts = slug.split('-').filter((p) => p.length > 1);
  for (const p of parts) {
    if (map[p]) return map[p];
  }

  // 2b) Fuzzy inclusion: if any known key is contained in the note slug (or vice versa)
  // Prefer longer keys to avoid matching overly short ones
  const keysByLength = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const key of keysByLength) {
    if (slug.includes(key) || key.includes(slug)) {
      return map[key];
    }
  }

  // 3) Local fallbacks (only if you still keep local assets in public/notes)
  // Try exact, then token fallback
  const localExact = `/notes/${slug}.png`;
  // You may want to proactively prefer a known extension order if not all are png:
  // try .webp / .jpg first if that’s your convention.
  // For simplicity, we return .png here.
  if (slug) return localExact;

  // Fallback to first token local path
  if (parts.length) return `/notes/${parts[0]}.png`;

  // 4) No image
  return undefined;
}