import type { User } from "@/lib/types";

export default function UserBadges({ user }: { user: Pick<User, "credibilityScore"> }) {
  const s = user.credibilityScore;
  const tier = s >= 80 ? "Trusted" : s >= 50 ? "Established" : "New";
  // UPDATED: Green theme colors
  const color = s >= 80 ? "bg-green-600" : s >= 50 ? "bg-emerald-600" : "bg-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${color}`}>{tier}</span>
  );
}