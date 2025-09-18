import type { User } from "@/lib/types";

export default function UserBadges({ user }: { user: Pick<User, "credibilityScore"> }) {
  const s = user.credibilityScore;
  const tier = s >= 80 ? "Trusted" : s >= 50 ? "Established" : "New";
  const color = s >= 80 ? "bg-emerald-600" : s >= 50 ? "bg-blue-600" : "bg-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs text-white ${color}`}>{tier}</span>
  );
}