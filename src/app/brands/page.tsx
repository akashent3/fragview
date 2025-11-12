import BrandsClient from './BrandsClient';
import { loadBrands } from './loaders';

type BrandItem = {
  _id: string;
  name: string;
  slug?: string;
  country?: string;
  description?: string;
  perfumes?: { name: string }[];
  perfumes_count?: number;
};

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const data = await loadBrands(searchParams);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <BrandsClient
          initialItems={data.items as BrandItem[]}
          total={data.total}
          meta={data.meta}
          query={data.query}
          pageSize={data.pageSize}
        />
      </div>
    </div>
  );
}