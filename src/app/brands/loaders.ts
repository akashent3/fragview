import 'server-only';
import { listBrands } from '@/lib/data/brands';
import { pageMeta } from '@/lib/pagination';
import { sanitizeBrandDocs } from '@/lib/sanitize';
import { safeTypesenseSearch } from '@/lib/typesense';

export type BrandSort = 'az' | 'za' | 'perfumes' | 'new';
const PAGE_SIZE = 25;

export async function loadBrands(searchParams: Record<string, string | string[] | undefined>) {
  const rawPage = searchParams.page;
  const page = (() => {
    const v = Array.isArray(rawPage) ? parseInt(rawPage[0] || '1', 10) : parseInt((rawPage as string) || '1', 10);
    return Number.isFinite(v) && v > 0 ? v : 1;
  })();

  const q = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';
  const letter = typeof searchParams.letter === 'string' ? searchParams.letter : 'All';
  const sortRaw = typeof searchParams.sort === 'string' ? searchParams.sort : 'name';

  let backendSort: BrandSort = 'az';
  if (sortRaw === 'name') backendSort = 'az';
  else if (sortRaw === 'fragrances') backendSort = 'perfumes';
  else if (sortRaw === 'founded') backendSort = 'new';
  else if (sortRaw === 'country') backendSort = 'az';
  else if (['az', 'za', 'perfumes', 'new'].includes(sortRaw)) backendSort = sortRaw as BrandSort;

  // Use Typesense only when q provided (and optionally letter)
  if (q) {
    const filterParts: string[] = [];
    if (letter && letter !== 'All') {
      filterParts.push(`first_letter:=${escapeFacet(letter)}`);
    }
    const filter_by = filterParts.join(' && ');
    const sortMap = {
      az: 'name:asc',
      za: 'name:desc',
      perfumes: 'perfumes_count:desc,name:asc',
      new: 'created_at:desc,name:asc',
    };
    const params = {
      q,
      query_by: 'name,description,country',
      per_page: PAGE_SIZE,
      page,
      sort_by: sortMap[backendSort],
      filter_by: filter_by || undefined,
      prefix: 'true',
      typo_tokens_threshold: 1,
    };
    const resp = await safeTypesenseSearch('brands', params);
    if (resp) {
      const items = resp.hits.map((d: any) => ({ ...d, _id: d.id }));
      const sanitized = sanitizeBrandDocs(items);
      const meta = pageMeta(resp.found, page, PAGE_SIZE);
      return {
        items: sanitized,
        total: resp.found,
        meta,
        query: { q, sort: sortRaw, letter },
        pageSize: PAGE_SIZE,
        source: 'typesense',
      };
    }
    // fallback below
  }

  const { items, total } = await listBrands({
    page,
    pageSize: PAGE_SIZE,
    search: q || undefined,
    sort: backendSort,
    letter,
  });

  const sanitized = sanitizeBrandDocs(items);
  const meta = pageMeta(total, page, PAGE_SIZE);
  return {
    items: sanitized,
    total,
    meta,
    query: { q, sort: sortRaw, letter },
    pageSize: PAGE_SIZE,
    source: 'mongo',
  };
}

function escapeFacet(v: string) {
  return v.replace(/([\\":])/g, '\\$1');
}