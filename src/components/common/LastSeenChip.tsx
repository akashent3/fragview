export default function LastSeenChip({ iso }: { iso?: string }) {
  if (!iso) return null;
  const d = new Date(iso);
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs text-green-700">
      Last seen {d.toLocaleDateString()}
    </span>
  );
}