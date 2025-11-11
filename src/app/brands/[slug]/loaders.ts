import 'server-only';
import { getBrandBySlug } from '@/lib/data/brands';
import { listPerfumes } from '@/lib/data/perfumes';
import { pageMeta } from '@/lib/pagination';
import { sanitizeSingleDoc, sanitizePerfumeDocs } from '@/lib/sanitize';

const PAGE_SIZE = 25;

export async function loadBrandDetail(slug: string, searchParams: Record<string, string | string[] | undefined>) {
  const brandRaw = await getBrandBySlug(slug);
  if (!brandRaw) return null;
  const brand = sanitizeSingleDoc(brandRaw);

  const rawPage = searchParams.page;
  const page = (() => {
    const v = Array.isArray(rawPage) ? parseInt(rawPage[0] || '1', 10) : parseInt((rawPage as string) || '1', 10);
    return Number.isFinite(v) && v > 0 ? v : 1;
  })();

  const gender = typeof searchParams.gender === 'string' ? searchParams.gender : '';
  const sortRaw = typeof searchParams.sort === 'string' ? searchParams.sort : 'az';
  const allowed = ['new', 'rating', 'az', 'za'] as const;
  const sort = allowed.includes(sortRaw as any) ? (sortRaw as any) : 'az';

  const { items, total } = await listPerfumes({
    page,
    pageSize: PAGE_SIZE,
    brand: brand.name,
    gender: gender || undefined,
    sort,
  });

  const perfumes = sanitizePerfumeDocs(items);
  const meta = pageMeta(total, page, PAGE_SIZE);

  return {
    brand,
    perfumes,
    meta,
    filters: { gender, sort },
    pageSize: PAGE_SIZE,
  };
}