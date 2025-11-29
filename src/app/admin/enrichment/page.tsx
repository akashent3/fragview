import { requireAdmin } from '@/lib/admin/permissions';
import { getNeedsEnrichment } from '@/lib/admin/enrichment';
import EnrichmentDashboard from '@/components/admin/EnrichmentDashboard';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Needs Enrichment | Admin',
};

export default async function EnrichmentPage() {
  await requireAdmin();
  const data = await getNeedsEnrichment();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Needs Enrichment</h1>
          <p className="text-gray-600">
            {data.perfumes.length} perfumes and {data.brands.length} brands need additional data
          </p>
        </div>
      </div>

      <EnrichmentDashboard perfumes={data.perfumes} brands={data.brands} />
    </div>
  );
}