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
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements - ADDED */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
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