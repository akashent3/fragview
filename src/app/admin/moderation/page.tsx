import { requireAdmin } from '@/lib/admin/permissions';
import ModerationQueueClient from './ModerationQueueClient';
import { ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Moderation Queue | FragView Admin',
  description: 'Review and moderate flagged content'
};

export default async function ModerationPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-gray-600">Review and moderate flagged content</p>
        </div>
      </div>

      <ModerationQueueClient />
    </div>
  );
}