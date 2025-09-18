"use client";
import { useMarket } from "@/lib/market-context";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function MarketSwitch() {
  const { market, currency, setMarket, setCurrency } = useMarket();
  const [markets, setMarkets] = useState<string[]>([]);

  useEffect(() => { api.listMarkets().then(setMarkets); }, []);

  return (
    <div className="flex items-center gap-2">
      <select value={market} onChange={(e) => setMarket(e.target.value as any)} className="rounded-md border bg-background px-2 py-1">
        {markets.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="rounded-md border bg-background px-2 py-1">
        <option value="INR">INR</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
    </div>
  );
}