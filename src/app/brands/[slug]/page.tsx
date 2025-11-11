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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <BrandDetailClient
        brand={data.brand}
        perfumes={data.perfumes}
        meta={data.meta}
        filters={data.filters}
        pageSize={data.pageSize}
      />
    </div>
  );
}