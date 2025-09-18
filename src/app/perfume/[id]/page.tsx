import { redirect } from "next/navigation";

// Legacy: /perfume/[id]  ->  Canonical: /perfumes/[slug]
// If your old "id" was a slug, this works now.
// If you had numeric IDs, do an id→slug lookup here before redirecting.
export default function LegacyPerfumeRoute({ params }: { params: { id: string } }) {
  redirect(`/perfumes/${params.id}`);
}
