import { requireAdmin } from '@/lib/admin/permissions';
import { getSubmissions } from '@/lib/admin/submissions';
import SubmissionsList from '@/components/admin/SubmissionsList';
import { Suspense } from 'react';
import { ClipboardList } from 'lucide-react';

export const metadata = {
  title: 'Community Submissions | Admin',
};

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  await requireAdmin();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
          <ClipboardList className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Submissions</h1>
          <p className="text-gray-600">Review user suggestions for missing perfumes and brands</p>
        </div>
      </div>

      {/* Submissions List */}
      <Suspense fallback={<div>Loading...</div>}>
        <SubmissionsListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SubmissionsListContent({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  const submissions = await getSubmissions({
    status: searchParams.status || 'PENDING',
    type: searchParams.type,
  });

  return <SubmissionsList submissions={submissions} />;
}