import { requireAdmin } from '@/lib/admin/permissions';
import { getPerfumeForEnrichment } from '@/lib/admin/enrichment';
import { notFound } from 'next/navigation';
import PerfumeEnrichmentClient from '@/components/admin/PerfumeEnrichmentClient';

export const metadata = {
  title: 'Enrich Perfume | Admin',
};

export default async function PerfumeEnrichmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const perfume = await getPerfumeForEnrichment(id);

  if (!perfume) {
    notFound();
  }

  return <PerfumeEnrichmentClient perfume={perfume} />;
}