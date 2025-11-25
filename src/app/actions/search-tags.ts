'use server';
import { typesenseClient } from '@/lib/typesense';

export async function searchTags(field: 'notes' | 'accords' | 'perfumers', query: string) {
  if (!typesenseClient) return [];
  
  try {
    // Map the frontend field names to your Typesense reference collection names
    // Based on your scripts/typesense-index-references.mjs
    const collectionMap: Record<string, string> = {
      'notes': 'pyramids',   // The script calls notes "pyramids"
      'accords': 'accords',
      'perfumers': 'perfumers'
    };

    const collectionName = collectionMap[field];
    if (!collectionName) return [];

    // Perform a standard search on the reference collection
    const searchResults = await typesenseClient.collections(collectionName).documents().search({
      q: query.trim() || '*', // '*' means match everything if query is empty
      query_by: 'name',
      per_page: 20,           // Limit suggestions
      sort_by: query.trim() ? '_text_match:desc' : undefined // Sort by relevance if typing, otherwise default order
    });

    // Extract just the names
    if (!searchResults.hits) return [];
    return searchResults.hits.map((h: any) => h.document.name as string);

  } catch (e: any) {
    // If the collection doesn't exist yet, return empty instead of crashing
    if (e?.httpStatus === 404) {
      console.warn(`Collection '${field}' not found in Typesense. Did you run 'scripts/typesense-index-references.mjs'?`);
      return [];
    }
    console.error("Tag search error:", e);
    return [];
  }
}