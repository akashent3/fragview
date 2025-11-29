'use server';

import { requireAdmin } from '@/lib/admin/permissions';
import {
  setFeaturedPerfumesAction,
  setTrendingBrandsAction,
  searchPerfumesForFeatured,
  searchBrandsForFeatured,
} from '@/lib/admin/featured';
import { revalidatePath } from 'next/cache';

export async function setFeaturedPerfumes(perfumeIds: string[]) {
  try {
    const admin = await requireAdmin();
    const result = await setFeaturedPerfumesAction(perfumeIds, admin.id);
    
    if (result.success) {
      revalidatePath('/');
      revalidatePath('/admin/featured');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setTrendingBrands(brandIds: string[]) {
  try {
    const admin = await requireAdmin();
    const result = await setTrendingBrandsAction(brandIds, admin.id);
    
    if (result.success) {
      revalidatePath('/');
      revalidatePath('/admin/featured');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function searchPerfumes(query: string) {
  try {
    await requireAdmin();
    return await searchPerfumesForFeatured(query);
  } catch (error) {
    return [];
  }
}

export async function searchBrands(query: string) {
  try {
    await requireAdmin();
    return await searchBrandsForFeatured(query);
  } catch (error) {
    return [];
  }
}