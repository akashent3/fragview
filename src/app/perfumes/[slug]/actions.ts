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
    if (!val) return undefined; 
    const parsed = parseFloat(String(val));
    return isNaN(parsed) ? undefined : parsed;
  };

  const rating = getFloat('rating');
  const longevity = getFloat('longevity');
  const sillage = getFloat('sillage');
  const text = formData.get('text'); 
  const photosJson = formData.get('photos'); // Expecting JSON string of URLs

  // Validation
  if (rating !== undefined && (rating < 1 || rating > 5)) return { ok: false, error: 'Rating must be 1-5.' };
  if (longevity !== undefined && (longevity < 0 || longevity > 5)) return { ok: false, error: 'Longevity must be 0-5.' };
  if (sillage !== undefined && (sillage < 0 || sillage > 5)) return { ok: false, error: 'Sillage must be 0-5.' };

  try {
    // Parse photos
    let photos: string[] = [];
    if (photosJson) {
      try {
        photos = JSON.parse(String(photosJson));
        if (!Array.isArray(photos)) photos = [];
      } catch {
        photos = [];
      }
    }

    // 1. Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        perfumeId: slug,
      }
    });

    // 2. Prepare data object
    const dataToSave: any = {};
    if (rating !== undefined) dataToSave.rating = Math.round(rating);
    if (longevity !== undefined) dataToSave.longevity = longevity;
    if (sillage !== undefined) dataToSave.sillage = sillage;
    if (text !== null && text !== undefined) {
        const strText = String(text).trim();
        if (strText.length > 0) dataToSave.text = strText;
    }
    if (photos.length > 0) {
      dataToSave.photos = photos;
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
      await prisma.review.create({
        data: {
          userId,
          perfumeId: slug,
          rating: dataToSave.rating || 0, 
          longevity: dataToSave.longevity,
          sillage: dataToSave.sillage,
          text: dataToSave.text || "",
          photos: photos
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