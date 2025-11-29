'use server';

import { requireAdmin } from '@/lib/admin/permissions';
import {
  updatePerfumeEnrichment as updatePerfumeEnrichmentLib,
  updateBrandEnrichment as updateBrandEnrichmentLib,
  markAsComplete as markAsCompleteLib,
} from '@/lib/admin/enrichment';
import { revalidatePath } from 'next/cache';

/**
 * Update perfume enrichment data
 */
export async function updatePerfumeEnrichment(perfumeId: string, data: any) {
  try {
    const admin = await requireAdmin();
    const result = await updatePerfumeEnrichmentLib(perfumeId, data, admin. id);
    
    if (result.success) {
      revalidatePath('/admin/enrichment');
      revalidatePath(`/admin/enrichment/perfumes/${perfumeId}`);
      revalidatePath('/'); // Revalidate homepage if perfume appears there
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update brand enrichment data
 */
export async function updateBrandEnrichment(brandId: string, data: any) {
  try {
    const admin = await requireAdmin();
    const result = await updateBrandEnrichmentLib(brandId, data, admin.id);
    
    if (result.success) {
      revalidatePath('/admin/enrichment');
      revalidatePath(`/admin/enrichment/brands/${brandId}`);
      revalidatePath('/'); // Revalidate homepage if brand appears there
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error. message };
  }
}

/**
 * Mark item as complete (skip enrichment)
 */
export async function markAsComplete(
  itemId: string,
  itemType: 'perfume' | 'brand'
) {
  try {
    const admin = await requireAdmin();
    const result = await markAsCompleteLib(itemId, itemType, admin.id);
    
    if (result.success) {
      revalidatePath('/admin/enrichment');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}