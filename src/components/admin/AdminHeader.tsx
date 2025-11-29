'use client';

import { Shield } from 'lucide-react';

interface Props {
  admin: {
    username: string;
    email: string;
    image: string | null;
  };
}

export default function AdminHeader({ admin }: Props) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-green-600" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
            FragView Admin
          </h1>
        </div>

        {/* Admin Info */}
        <div className="flex items-center gap-3">
          {admin.image ?  (
            <img
              src={admin.image}
              alt={admin.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
              {admin.username. charAt(0). toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{admin.username}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}