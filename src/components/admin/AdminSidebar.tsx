'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  Building2,
  FileText,
  Star,
  TrendingUp,
  Settings,
  ClipboardList,
  BarChart3,
  ShieldAlert,
  Palette,
  AlertCircle, // ✅ Added for Enrichment
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Submissions', href: '/admin/submissions', icon: ClipboardList },
  { name: 'Brand Applications', href: '/admin/brand-applications', icon: Building2 },
  { name: 'Needs Enrichment', href: '/admin/enrichment', icon: AlertCircle }, // ✅ NEW
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Perfumes', href: '/admin/perfumes', icon: Package },
  { name: 'Brands', href: '/admin/brands', icon: Building2 },
  { name: 'Featured Content', href: '/admin/featured', icon: Star },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item. href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ?  'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to Site */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          ← Back to Site
        </Link>
      </div>
    </aside>
  );
}