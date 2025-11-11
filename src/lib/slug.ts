// Pure functions to normalize brand & perfume slugs.
// Keeps things deterministic; does NOT write to DB directly.

export function toKebab(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Perfume slug pattern: brand-slug + '-' + variant slug
export function perfumeSlug(brandName: string, variantName: string) {
  return `${toKebab(brandName)}-${toKebab(variantName)}`;
}