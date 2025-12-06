import { requireAdmin } from '@/lib/admin/permissions';
import { getBrandApplications } from '@/lib/admin/brand-applications';
import BrandApplicationsList from '@/components/admin/BrandApplicationsList';
import { Suspense } from 'react';
import { Building2 } from 'lucide-react';

export const metadata = {
  title: 'Brand Applications | Admin',
};

export default async function BrandApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Owner Applications</h1>
          <p className="text-gray-600">Review and verify brand ownership claims</p>
        </div>
      </div>

      {/* Applications List */}
      <Suspense fallback={<div>Loading... </div>}>
        <BrandApplicationsListContent searchParams={await searchParams} />
      </Suspense>
    </div>
  );
}

async function BrandApplicationsListContent({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const applications = await getBrandApplications({
    status: searchParams.status || 'PENDING',
  });

  return <BrandApplicationsList applications={applications} />;
}