'use server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitReview(slug: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, error: 'Not signed in.' };

  const userId = session.user.id;

  // Helper to get float or null (allowing decimals now)
  const getFloat = (key: string) => {
    const val = formData.get(key);
    if (!val) return undefined; // undefined means "do not touch this field"
    const parsed = parseFloat(String(val));
    return isNaN(parsed) ? undefined : parsed;
  };

  const rating = getFloat('rating');
  const longevity = getFloat('longevity');
  const sillage = getFloat('sillage');
  const text = formData.get('text'); // string | null

  // Validation: Ensure inputs are within range if provided
  if (rating !== undefined && (rating < 1 || rating > 5)) return { ok: false, error: 'Rating must be 1-5.' };
  if (longevity !== undefined && (longevity < 0 || longevity > 5)) return { ok: false, error: 'Longevity must be 0-5.' };
  if (sillage !== undefined && (sillage < 0 || sillage > 5)) return { ok: false, error: 'Sillage must be 0-5.' };

  try {
    // 1. Check if review already exists for this user + perfume
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        perfumeId: slug,
      }
    });

    // 2. Prepare data object
    // We only include fields that were actually sent in the form data
    const dataToSave: any = {};
    if (rating !== undefined) dataToSave.rating = Math.round(rating); // Schema is Int for rating (1-5 stars usually integers)
    // If you REALLY want decimal star ratings in DB, you need to change Prisma schema to Float. 
    // For now, standard star ratings are usually stored as Int or increments of 0.5 (which usually requires Float in DB or scaling).
    // Assuming schema is Int for Rating, but Float/Int? for sliders.
    
    if (longevity !== undefined) dataToSave.longevity = longevity;
    if (sillage !== undefined) dataToSave.sillage = sillage;
    if (text !== null && text !== undefined) {
        const strText = String(text).trim();
        if (strText.length > 0) dataToSave.text = strText;
    }

    if (Object.keys(dataToSave).length === 0) {
        return { ok: false, error: "No data to save." };
    }

    if (existingReview) {
      // UPDATE existing
      await prisma.review.update({
        where: { id: existingReview.id },
        data: dataToSave,
      });
    } else {
      // CREATE new
      // For new reviews, we need to ensure required fields (like 'text' or 'rating') have defaults if missing
      // Depending on your schema, 'rating' might be required.
      // If rating is missing in a partial update (e.g. only sillage slider moved), we default to 0 or null if schema allows.
      await prisma.review.create({
        data: {
          userId,
          perfumeId: slug,
          rating: dataToSave.rating || 0, // Default if not provided
          longevity: dataToSave.longevity,
          sillage: dataToSave.sillage,
          text: dataToSave.text || "",
        }
      });
    }

    revalidatePath(`/perfumes/${slug}`);
    return { ok: true };
  } catch (e) {
    console.error("Review submission error:", e);
    return { ok: false, error: "Failed to save review." };
  }
}