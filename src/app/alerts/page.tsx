import { api } from "@/lib/api";

export const metadata = { title: "Alerts • Fragview" };

export default async function AlertsPage() {
  const list = await api.listAlerts();
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Alerts</h1>
      <ul className="space-y-2">
        {list.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="font-medium">{a.slug} — {a.sizeMl} ml</div>
              <div className="text-sm text-muted-foreground">Threshold: {a.threshold}</div>
            </div>
            <button className="rounded-md border px-3 py-1 hover:bg-muted">Disable</button>
          </li>
        ))}
      </ul>
    </div>
  );
}