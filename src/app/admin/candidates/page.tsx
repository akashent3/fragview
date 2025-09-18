export const metadata = { title: "Candidates • Fragview" };

export default function CandidatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Merge Candidates</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="mb-2 font-medium">Incoming</h3>
          <dl className="space-y-1 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd>ACME Citrus Oud</dd>
            <dt className="text-muted-foreground">Brand</dt>
            <dd>ACME</dd>
          </dl>
        </div>
        <div className="rounded-xl border p-4">
          <h3 className="mb-2 font-medium">Existing</h3>
          <dl className="space-y-1 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd>Citrus Oud</dd>
            <dt className="text-muted-foreground">Brand</dt>
            <dd>ACME Parfums</dd>
          </dl>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="rounded-md bg-primary px-3 py-1 text-white">Merge</button>
        <button className="rounded-md border px-3 py-1">Skip</button>
      </div>
    </div>
  );
}