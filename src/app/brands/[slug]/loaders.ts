import 'server-only';
import { getBrandBySlug } from '@/lib/data/brands';
import { listPerfumes } from '@/lib/data/perfumes';
import { pageMeta } from '@/lib/pagination';
import { sanitizeSingleDoc, sanitizePerfumeDocs } from '@/lib/sanitize';

const PAGE_SIZE = 25;

// Export shared types so the client component consumes the SAME definitions.
export interface BrandDoc {
  _id: any;
  name: string;
  slug?: string;
  country?: string;
  description?: string;
  [key: string]: any;
}

export interface PerfumeDoc {
  _id: any;
  brand_name: string;
  variant_name: string;
  slug?: string;
  image?: string;
  gender?: string;
  rating?: number;
  [key: string]: any;
}

export interface BrandDetailResult {
  brand: BrandDoc;
  perfumes: PerfumeDoc[];
  meta: { page: number; totalPages: number; total: number };
  filters: { gender: string; sort: string };
  pageSize: number;
}

export async function loadBrandDetail(
  slug: string,
  searchParams: Record<string, string | string[] | undefined>
): Promise<BrandDetailResult | null> {
  const brandRaw = await getBrandBySlug(slug);
  if (!brandRaw) return null;
  const brand = sanitizeSingleDoc(brandRaw) as BrandDoc;

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

  // Cast to the shared PerfumeDoc type (types only; data unchanged).
  const perfumes = sanitizePerfumeDocs(items) as PerfumeDoc[];
  const meta = pageMeta(total, page, PAGE_SIZE);

  return {
    brand,
    perfumes,
    meta,
    filters: { gender, sort },
    pageSize: PAGE_SIZE,
  };
}