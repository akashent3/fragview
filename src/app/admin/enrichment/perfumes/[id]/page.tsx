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
  params: { id: string };
}) {
  await requireAdmin();
  const perfume = await getPerfumeForEnrichment(params.id);

  if (!perfume) {
    notFound();
  }

  return <PerfumeEnrichmentClient perfume={perfume} />;
}