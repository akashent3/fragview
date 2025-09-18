import MarketSwitch from "@/components/common/MarketSwitch";

export const metadata = { title: "Settings • Fragview" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Market & Currency</h2>
        <MarketSwitch />
        <p className="text-sm text-muted-foreground">Default market is IN (India). You can override anytime.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Notifications</h2>
        <div className="flex items-center gap-2">
          <input id="alerts" type="checkbox" defaultChecked className="h-4 w-4" />
          <label htmlFor="alerts">Enable price/back-in-stock alerts</label>
        </div>
      </section>
    </div>
  );
}