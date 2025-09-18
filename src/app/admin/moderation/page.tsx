export const metadata = { title: "Moderation • Fragview" };

export default function ModerationPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Moderation Queue</h1>
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="text-left">
            <th className="border-b p-2">Type</th>
            <th className="border-b p-2">Preview</th>
            <th className="border-b p-2">From</th>
            <th className="border-b p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              <td className="border-b p-2">Review</td>
              <td className="border-b p-2">“Nice citrus, smooth oud…”</td>
              <td className="border-b p-2">@ava</td>
              <td className="border-b p-2">
                <div className="flex gap-2">
                  <button className="rounded-md bg-emerald-600 px-3 py-1 text-white">Approve</button>
                  <button className="rounded-md bg-red-600 px-3 py-1 text-white">Reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}