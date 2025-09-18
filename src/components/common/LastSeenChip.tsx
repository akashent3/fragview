export default function LastSeenChip({ iso }: { iso?: string }) {
  if (!iso) return null;
  const d = new Date(iso);
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Last seen {d.toLocaleDateString()}</span>
  );
}