import { requireAdmin } from '@/lib/admin/permissions';
import { getUserByUsername } from '@/lib/admin/users';
import { notFound } from 'next/navigation';
import UserManagementClient from '@/components/admin/UserManagementClient'; // We will create this component
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ManageUserPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await requireAdmin();
  if (session.role !== 'ADMIN') return <div>Access Denied</div>;

  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage User</h1>
          <p className="text-gray-600">Update roles and permissions for @{user.username}</p>
        </div>
      </div>
      
      {/* Client Component to handle actions */}
      <UserManagementClient user={user} adminId={session.id} />
    </div>
  );
}