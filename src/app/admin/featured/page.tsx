import { requireAdmin } from '@/lib/admin/permissions';
import { getFeaturedContent } from '@/lib/admin/featured';
import FeaturedContentManager from '@/components/admin/FeaturedContentManager';
import { Star } from 'lucide-react';

export const metadata = {
  title: 'Featured Content | Admin',
};

export default async function FeaturedContentPage() {
  await requireAdmin();
  const featuredContent = await getFeaturedContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <Star className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Featured Content</h1>
          <p className="text-gray-600">Manage homepage featured perfumes and trending brands</p>
        </div>
      </div>

      <FeaturedContentManager initialData={featuredContent} />
    </div>
  );
}