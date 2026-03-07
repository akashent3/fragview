'use client';

import { useState } from 'react';
import { Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';
// ✅ Import the Server Action
import { updateUserRole } from '@/app/actions/admin/users';

export default function UserManagementClient({ user, adminId }: { user: any, adminId: string }) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    if (role === newRole) return;
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    setLoading(true);
    
    // ✅ Call Server Action
    const result = await updateUserRole(user.id, newRole as any);

    if (result.success) {
      setRole(newRole);
      alert(`User role updated to ${newRole}`);
    } else {
      alert('Failed to update role');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden">
             {user.image ? (
               <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
             ) : (
               user.username[0].toUpperCase()
             )}
           </div>
           <div>
             <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
             <p className="text-gray-500">{user.email}</p>
             <p className="text-xs text-gray-400">ID: {user.id}</p>
           </div>
        </div>
        <div className="text-right">
           <div className="text-sm font-medium text-gray-500">Current Role</div>
           <div className={`text-lg font-bold ${
             role === 'ADMIN' ? 'text-red-600' : 
             role === 'MODERATOR' ? 'text-blue-600' : 
             role === 'EDITOR' ? 'text-purple-600' : 'text-gray-700'
           }`}>{role}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Change Role</h3>
          <div className="flex gap-2 flex-wrap">
            {['USER', 'MODERATOR', 'EDITOR', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  role === r 
                    ? 'bg-green-50 border-green-500 text-green-700 ring-2 ring-green-500 ring-offset-2' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        
        {/* ... (Ban/Delete actions can be added here similarly) ... */}
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      )}
    </div>
  );
}