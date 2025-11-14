import { loadBrandDetail } from './loaders';
import BrandDetailClient from './BrandDetailClient';
import { notFound } from 'next/navigation';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const url = `https://fragviewvercel.vercel.app/brands/${slug}`;
  return {
    title: `Brand: ${slug} | FragView`,
    description: `Explore perfumes by ${slug} on FragView: fragrance listings, filters and more.`,
    alternates: { canonical: url },
  };
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const data = await loadBrandDetail(params.slug, searchParams);
  if (!data) return notFound();

  return (
    <div className="min-h-screen relative overflow-hidden py-6" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements - ADDED */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <BrandDetailClient
          brand={data.brand}
          perfumes={data.perfumes}
          meta={data.meta}
          filters={data.filters}
          pageSize={data.pageSize}
        />
      </div>
    </div>
  );
}