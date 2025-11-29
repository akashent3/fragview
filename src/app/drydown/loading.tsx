import { Newspaper } from 'lucide-react';

export default function DrydownLoading() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAFFF5] text-gray-800">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Newspaper size={14} /> Editorial
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
            The Drydown
          </h1>
          <div className="h-6 bg-gray-200 rounded-full w-96 mx-auto animate-pulse" />
        </div>

        {/* Category Filter Skeleton */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7]. map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Featured Article Skeleton */}
        <div className="mb-16">
          <div className="relative h-[500px] w-full rounded-3xl overflow-hidden bg-gray-200 animate-pulse" />
        </div>

        {/* Recent Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[1, 2, 3, 4, 5, 6]. map((i) => (
            <div key={i} className="bg-white/60 backdrop-blur-md rounded-2xl border border-green-100 overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}