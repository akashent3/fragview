import { requireAdmin } from '@/lib/admin/permissions';
import { getBrandApplicationById } from '@/lib/admin/brand-applications';
import { notFound } from 'next/navigation';
import BrandApplicationReviewClient from '@/components/admin/BrandApplicationReviewClient';

export const metadata = {
  title: 'Review Brand Application | Admin',
};

export default async function BrandApplicationReviewPage({ params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const application = await getBrandApplicationById(id);

  if (! application) {
    notFound();
  }

  return <BrandApplicationReviewClient application={application} />;
}