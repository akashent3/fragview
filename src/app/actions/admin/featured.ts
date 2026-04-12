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
    const results = await searchPerfumesForFeatured(query);
    return results.map((p) => ({
      _id: p._id.toString(),
      name: p.name ?? null,
      variant_name: p.variant_name ?? null,
      brand_name: p.brand_name ?? null,
      image: p.image ?? null,
      slug: p.slug ?? null,
    }));
  } catch (error) {
    return [];
  }
}

export async function searchBrands(query: string) {
  try {
    await requireAdmin();
    const results = await searchBrandsForFeatured(query);
    return results.map((b) => ({
      _id: b._id.toString(),
      name: b.name ?? null,
      logo: b.logo ?? null,
      slug: b.slug ?? null,
    }));
  } catch (error) {
    return [];
  }
}