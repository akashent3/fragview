"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Currency, Market } from "./types";

interface MarketState {
  market: Market; // default IN
  currency: Currency; // default INR
  setMarket: (m: Market) => void;
  setCurrency: (c: Currency) => void;
}

const MarketContext = createContext<MarketState | undefined>(undefined);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [market, setMarket] = useState<Market>("IN");
  const [currency, setCurrency] = useState<Currency>("INR");

  // could hydrate from localStorage
  useEffect(() => {
    try {
      const m = localStorage.getItem("market");
      const c = localStorage.getItem("currency");
      if (m) setMarket(m as Market);
      if (c) setCurrency(c as Currency);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("market", market); } catch {}
  }, [market]);
  useEffect(() => {
    try { localStorage.setItem("currency", currency); } catch {}
  }, [currency]);

  return (
    <MarketContext.Provider value={{ market, currency, setMarket, setCurrency }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}