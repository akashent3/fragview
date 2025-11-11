'use server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitReview(slug: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, error: 'Not signed in.' };

  const ratingFloat = parseFloat(String(formData.get('rating') ?? '0'));
  const rating = Math.max(1, Math.min(5, Math.round(ratingFloat))) | 0;
  const text = String(formData.get('text') ?? '').trim();

  if (!(rating >= 1 && rating <= 5)) {
    return { ok: false, error: 'Rating must be between 1 and 5.' };
  }
  if (!text) {
    return { ok: false, error: 'Review text is required.' };
  }

  await prisma.review.create({
    data: {
      perfumeId: slug,
      userId: (session.user as any).id || session.user.email || 'unknown',
      rating,
      text,
    },
  });

  revalidatePath(`/perfumes/${slug}`);
  return { ok: true };
}