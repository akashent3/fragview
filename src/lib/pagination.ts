export function parsePageParam(value: string | string[] | undefined, fallback = 1) {
  if (!value) return fallback;
  const n = Array.isArray(value) ? parseInt(value[0] || '', 10) : parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function pageMeta(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  return { total, page: current, pageSize, totalPages, hasPrev: current > 1, hasNext: current < totalPages };
}