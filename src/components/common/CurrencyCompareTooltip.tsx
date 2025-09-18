export default function CurrencyCompareTooltip({ base, inr, usd, eur }: { base: string; inr?: number; usd?: number; eur?: number; }) {
  return (
    <div className="text-xs text-muted-foreground">
      {base} {inr ? `• ₹${inr}` : ""} {usd ? `• $${usd}` : ""} {eur ? `• €${eur}` : ""}
    </div>
  );
}