import 'server-only';
import { getBrandBySlug } from '@/lib/data/brands';
import { listPerfumes } from '@/lib/data/perfumes';
import { pageMeta } from '@/lib/pagination';
import { sanitizeSingleDoc, sanitizePerfumeDocs } from '@/lib/sanitize';

const PAGE_SIZE = 1000;

export interface BrandDoc {
  _id: any;
  name: string;
  slug?: string;
  country?: string;
  description?: string;
  official_website?: string;
  perfumes?: Array<{
    name: string;
    gender: string;
    release_year: number;
    collection?: string;
    collection_slug?: string;
  }>;
  collections_info?: Array<{ name: string; slug: string; perfume_count?: number }>;
  [key: string]: any;
}

export interface PerfumeDoc {
  _id: any;
  brand_name: string;
  variant_name: string;
  slug?: string;
  image?: string;
  perfume_image?: string;
  gender?: string;
  rating?: number;
  release_year?: number;
  collection?: string;
  [key: string]: any;
}

export interface BrandDetailResult {
  brand: BrandDoc;
  perfumes: PerfumeDoc[];
  meta: { page: number; totalPages: number; total: number };
  filters: { gender: string; collection: string; sort: string };
  pageSize: number;
}

export async function loadBrandDetail(
  slug: string,
  searchParams: Record<string, string | string[] | undefined>
): Promise<BrandDetailResult | null> {
  const brandRaw = await getBrandBySlug(slug);
  if (!brandRaw) return null;
  const brand = sanitizeSingleDoc(brandRaw) as BrandDoc;

  const gender = typeof searchParams.gender === 'string' ? searchParams.gender : '';
  const collection = typeof searchParams.collection === 'string' ? searchParams.collection : '';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'az';

  // Load ALL perfumes for this brand
  const { items, total } = await listPerfumes({
    page: 1,
    pageSize: PAGE_SIZE,
    brand: brand.name,
  });

  // MERGE gender AND collection data from brand.perfumes into the actual perfume docs
  const perfumesWithCorrectData = sanitizePerfumeDocs(items).map((perfume: any) => {
    // Find matching perfume in brand.perfumes array by name
    const brandPerfume = brand.perfumes?.find(
      bp => bp.name.toLowerCase().trim() === perfume.variant_name.toLowerCase().trim()
    );
    
    // Override with correct data from brand.perfumes
    return {
      ...perfume,
      gender: brandPerfume?.gender || perfume.gender, // ✅ Use gender from brand.perfumes
      collection: brandPerfume?.collection || undefined,
      collection_slug: brandPerfume?.collection_slug || undefined,
    };
  }) as PerfumeDoc[];

  const meta = { page: 1, totalPages: 1, total: perfumesWithCorrectData.length };

  return {
    brand,
    perfumes: perfumesWithCorrectData,
    meta,
    filters: { gender, collection, sort },
    pageSize: PAGE_SIZE,
  };
}