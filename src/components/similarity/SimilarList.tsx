import Link from "next/link";
import { Sparkles } from 'lucide-react';

export default function SimilarList({ items }: { items?: Array<{ slug: string; name: string; brandName: string; rating?: number }>; }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-green-600" />
        Top 10 similar
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link key={p.slug} href={`/perfumes/${p.slug}`} className="glass-card rounded-lg p-3 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="font-medium text-gray-900">{p.name}</div>
            <div className="text-sm text-gray-600">{p.brandName} {p.rating ? `• ${p.rating.toFixed(1)}⭐` : ""}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}