import UserBadges from "@/components/gamification/UserBadges";

export default function PublicProfile({ params }: { params: { username: string } }) {
  const user = { username: params.username, credibilityScore: 62 };
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-muted" />
        <div>
          <h1 className="text-xl font-semibold">@{user.username}</h1>
          <UserBadges user={user} />
        </div>
      </header>

      <section>
        <h2 className="mb-2 text-lg font-medium">Wardrobe</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg border" />
          ))}
        </div>
      </section>
    </div>
  );
}