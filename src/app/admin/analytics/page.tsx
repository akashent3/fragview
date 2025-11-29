import { requireAdmin } from '@/lib/admin/permissions';
import { getAnalytics } from '@/lib/admin/analytics';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { BarChart3 } from 'lucide-react';

export const metadata = {
  title: 'Analytics | Admin',
};

export default async function AnalyticsPage() {
  await requireAdmin();
  const analytics = await getAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Site performance and user metrics</p>
        </div>
      </div>

      <AnalyticsDashboard data={analytics} />
    </div>
  );
}