import { requireAdmin } from '@/lib/admin/permissions';
import { getUsers } from '@/lib/admin/users';
import UsersListClient from '@/components/admin/UsersListClient';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'User Management | Admin',
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; page?: string };
}) {
  await requireAdmin();
  
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const roleFilter = searchParams.role || 'all';

  const { users, total } = await getUsers({ search, role: roleFilter, page, limit: 50 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
      </div>

      <UsersListClient users={users} total={total} currentPage={page} />
    </div>
  );
}