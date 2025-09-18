"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function PriceAlertButton({ slug, sizeMl }: { slug: string; sizeMl: number }) {
  const [open, setOpen] = useState(false);
  const [threshold, setThreshold] = useState<number>(0);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await api.upsertAlert(slug, sizeMl, threshold);
    setSaved(true);
    setOpen(false);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={() => setOpen(true)} className="rounded-md border px-3 py-1 text-sm hover:bg-muted">Price alert</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-background p-4 shadow-lg">
            <h3 className="mb-2 text-lg font-medium">Set alert</h3>
            <input type="number" className="w-full rounded-md border px-3 py-2" placeholder="Threshold price" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} />
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded-md px-3 py-1 hover:bg-muted" onClick={() => setOpen(false)}>Cancel</button>
              <button className="rounded-md bg-primary px-3 py-1 text-white" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
      {saved && <span className="text-xs text-green-600">Saved!</span>}
    </div>
  );
}