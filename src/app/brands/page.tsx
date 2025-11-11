import { loadBrands } from './loaders';
import BrandsClient from './BrandsClient';

export const revalidate = 300;

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const baseUrl = 'https://fragviewvercel.vercel.app/brands';
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const title = q ? `Fragrance Brands matching "${q}" | FragView` : 'Fragrance Brands | FragView';
  const description =
    'Browse fragrance brands on FragView. Discover perfume houses, descriptions, countries and collections.';
  const canonical = q ? `${baseUrl}?q=${encodeURIComponent(q)}` : baseUrl;
  return { title, description, alternates: { canonical } };
}

export default async function BrandsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const data = await loadBrands(searchParams);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <BrandsClient
          initialItems={data.items}
          total={data.total}
          meta={data.meta}
          query={data.query}
          pageSize={data.pageSize}
        />
      </div>
    </div>
  );
}