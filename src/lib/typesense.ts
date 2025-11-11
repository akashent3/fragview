import Typesense, { SearchParameters } from 'typesense';

const apiKey = process.env.TYPESENSE_API_KEY || '';
const host = process.env.TYPESENSE_HOST || '';
const port = parseInt(process.env.TYPESENSE_PORT || '443', 10);
const protocol = process.env.TYPESENSE_PROTOCOL || 'https';
const timeoutMs = parseInt(process.env.TYPESENSE_TIMEOUT_MS || '5000', 10);
export const FALLBACK_LATENCY_MS = parseInt(process.env.TYPESENSE_FALLBACK_LATENCY_MS || '700', 10);

export const typesenseClient = (apiKey && host)
  ? new Typesense.Client({
      nodes: [{ host, port, protocol }],
      apiKey,
      connectionTimeoutSeconds: Math.ceil(timeoutMs / 1000),
    })
  : null;

export async function safeTypesenseSearch<T = any>(
  collection: string,
  params: SearchParameters
): Promise<{ hits: T[]; found: number; tookMs: number; aborted: boolean } | null> {
  if (!typesenseClient) return null;
  const start = performance.now();
  try {
    const resp: any = await typesenseClient.collections(collection).documents().search(params);
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