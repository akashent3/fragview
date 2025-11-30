import { requireAdmin } from '@/lib/admin/permissions';
import { getDashboardStats, getRecentActivity } from '@/lib/admin/stats';
import StatsCard from '@/components/admin/StatsCard';
import ActivityFeed from '@/components/admin/ActivityFeed';
import QuickActions from '@/components/admin/QuickActions';
import { 
  Users, 
  Package, 
  Building2, 
  Star, 
  AlertCircle,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | FragView',
  description: 'FragView admin control panel',
};

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();
  const recentActivity = await getRecentActivity(10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {admin.username}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.users. total}
          change={`+${stats.users.recent} this week`}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total Perfumes"
          value={stats.content.perfumes}
          icon={Package}
          color="green"
        />
        <StatsCard
          title="Total Brands"
          value={stats.content.brands}
          icon={Building2}
          color="orange"
        />
        <StatsCard
          title="Total Reviews"
          value={stats.content.reviews}
          icon={Star}
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Active Users (30d)"
          value={stats.users.active}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Wardrobe Items"
          value={stats.content.wardrobeItems}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Notifications Sent"
          value={stats.notifications}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Pending Items Alert */}
      {stats.pending.total > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5"/>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900">
                {stats.pending.total} Pending Item{stats.pending.total !== 1 ? 's' : ''}
              </h3>
              <p className="text-orange-700 text-sm mt-1">
                {stats.pending.submissions} community submission{stats.pending.submissions !== 1 ? 's' : ''} and{' '}
                {stats.pending.brandApplications} brand application{stats.pending.brandApplications !== 1 ? 's' : ''} awaiting review
              </p>
              <div className="flex gap-3 mt-3">
                <a
                  href="/admin/submissions"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 underline"
                >
                  Review Submissions →
                </a>
                <a
                  href="/admin/brand-applications"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 underline"
                >
                  Review Applications →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions pendingCount={stats.pending.total} />

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <ActivityFeed activities={recentActivity} />
      </div>
    </div>
  );
}