export type SearchParams = Record<string, string | string[] | undefined>;

export function getString(sp: SearchParams, key: string, fallback = '') {
  const v = sp[key];
  if (!v) return fallback;
  return Array.isArray(v) ? String(v[0] ?? fallback) : String(v);
}

export function getEnum<T extends string>(sp: SearchParams, key: string, allowed: readonly T[], fallback: T) {
  const raw = getString(sp, key, '');
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}