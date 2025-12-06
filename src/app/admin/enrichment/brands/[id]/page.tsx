import { requireAdmin } from '@/lib/admin/permissions';
import { getBrandForEnrichment } from '@/lib/admin/enrichment';
import { notFound } from 'next/navigation';
import BrandEnrichmentClient from '@/components/admin/BrandEnrichmentClient';

export const metadata = {
  title: 'Enrich Brand | Admin',
};

export default async function BrandEnrichmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
   const { id } = await params;
  const brand = await getBrandForEnrichment(id);

  if (!brand) {
    notFound();
  }

  return <BrandEnrichmentClient brand={brand} />;
}