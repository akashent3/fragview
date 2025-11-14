import { loadPerfumes } from './loaders';
import PerfumesClient from './PerfumesClient';

export const revalidate = 300;

export async function generateMetadata({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const baseUrl = 'https://fragviewvercel.vercel.app/perfumes';
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const title = q ? `Perfumes matching "${q}" | FragView` : 'Perfume Listing | FragView';
  const description =
    'Discover perfumes on FragView. Filter by brand, gender, rating and explore fragrance details.';
  return {
    title,
    description,
    alternates: { canonical: q ? `${baseUrl}?q=${encodeURIComponent(q)}` : baseUrl },
  };
}

export default async function PerfumesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const data = await loadPerfumes(searchParams);
  return (
    <div className="min-h-screen relative overflow-hidden py-6" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements - ADDED */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <PerfumesClient
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