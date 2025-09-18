import LastSeenChip from "@/components/common/LastSeenChip";
import CurrencyCompareTooltip from "@/components/common/CurrencyCompareTooltip";
import type { BestPricesBySize } from "@/lib/types";

export default function PriceBox({ slug, prices, capturedAt }: { slug: string; prices?: BestPricesBySize; capturedAt?: string; }) {
  if (!prices) return null;

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Best price by size</h3>
        <LastSeenChip iso={capturedAt} />
      </div>

      <div className="space-y-3">
        {Object.entries(prices).map(([size, data]) => (
          <div key={size} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{size} ml</div>
              <a className="text-primary underline-offset-2 hover:underline" href={data.best.url} target="_blank" rel="noreferrer">
                {data.best.retailer} — {data.best.currency} {data.best.price}
              </a>
            </div>
            <CurrencyCompareTooltip base={data.best.currency} />
            {data.others.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm underline underline-offset-2">View other offers</summary>
                <ul className="mt-2 space-y-1 text-sm">
                  {data.others.map((o, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <a className="underline-offset-2 hover:underline" href={o.url} target="_blank" rel="noreferrer">{o.retailer}</a>
                      <span>{o.currency} {o.price}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}