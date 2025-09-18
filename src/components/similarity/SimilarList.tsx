import Link from "next/link";

export default function SimilarList({ items }: { items?: Array<{ slug: string; name: string; brandName: string; rating?: number }>; }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Top 10 similar</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link key={p.slug} href={`/perfumes/${p.slug}`} className="rounded-lg border p-3 hover:bg-muted">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-muted-foreground">{p.brandName} {p.rating ? `• ${p.rating.toFixed(1)}` : ""}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}