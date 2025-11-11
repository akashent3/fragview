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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PerfumesClient
        initialItems={data.items}
        total={data.total}
        meta={data.meta}
        query={data.query}
        pageSize={data.pageSize}
      />
    </div>
  );
}