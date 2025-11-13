import Typesense from 'typesense';

const apiKey = process.env.TYPESENSE_API_KEY || '';
const host = process.env.TYPESENSE_HOST || '';
const port = parseInt(process.env.TYPESENSE_PORT || '443', 10);
const protocol = process.env.TYPESENSE_PROTOCOL || 'https';
const timeoutMs = parseInt(process.env.TYPESENSE_TIMEOUT_MS || '5000', 10);
// Increased fallback threshold from 700ms to 1000ms for large datasets
export const FALLBACK_LATENCY_MS = parseInt(process.env.TYPESENSE_FALLBACK_LATENCY_MS || '1000', 10);

export const typesenseClient = (apiKey && host)
  ? new Typesense.Client({
      nodes: [{ host, port, protocol }],
      apiKey,
      connectionTimeoutSeconds: Math.ceil(timeoutMs / 1000),
      // Add caching and retry logic
      numRetries: 2,
      retryIntervalSeconds: 0.5,
    })
  : null;

// In-memory cache for autocomplete results (5 min TTL)
const autocompleteCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function safeTypesenseSearch<T = any>(
  collection: string,
  params: any
): Promise<{ hits: T[]; found: number; tookMs: number; aborted: boolean } | null> {
  if (!typesenseClient) return null;
  const start = performance.now();
  try {
    const resp: any = await (typesenseClient as any).collections(collection).documents().search(params);
    const tookMs = performance.now() - start;
    if (tookMs > FALLBACK_LATENCY_MS) {
      // Consider this too slow → prefer fallback; return null to trigger Mongo route
      return null;
    }
    const hits = resp.hits?.map((h: any) => h.document) || [];
    return { hits, found: resp.found || hits.length, tookMs, aborted: false };
  } catch (e) {
    return null;
  }
}

// Fast autocomplete search with caching
export async function typesenseAutocomplete<T = any>(
  collection: string,
  query: string,
  limit: number = 5,
  queryBy: string = 'name'
): Promise<T[]> {
  if (!typesenseClient || !query.trim()) return [];

  const cacheKey = `${collection}:${query}:${limit}`;
  const cached = autocompleteCache.get(cacheKey);
  
  // Return cached result if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const resp: any = await (typesenseClient as any)
      .collections(collection)
      .documents()
      .search({
        q: query,
        query_by: queryBy,
        per_page: limit,
        prefix: 'true',
        typo_tokens_threshold: 1,
        // Optimize for speed
        exhaustive_search: false,
        drop_tokens_threshold: 1,
      });

    const hits = resp.hits?.map((h: any) => h.document) || [];
    
    // Cache the result
    autocompleteCache.set(cacheKey, { data: hits, timestamp: Date.now() });
    
    // 🔧 FIXED: Clean old cache entries (simple LRU) - check if firstKey exists
    if (autocompleteCache.size > 100) {
      const firstKey = autocompleteCache.keys().next().value;
      if (firstKey !== undefined) {  // ✅ Type guard to ensure firstKey is not undefined
        autocompleteCache.delete(firstKey);
      }
    }

    return hits;
  } catch (e) {
    console.error('Typesense autocomplete error:', e);
    return [];
  }
}

// Clear cache utility (call when data updates)
export function clearTypesenseCache() {
  autocompleteCache.clear();
}