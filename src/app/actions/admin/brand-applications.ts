'use server';

import { requireAdmin } from '@/lib/admin/permissions';
import {
  approveBrandApplicationAction,
  rejectBrandApplicationAction,
} from '@/lib/admin/brand-applications';
import { revalidatePath } from 'next/cache';

export async function approveBrandApplication(applicationId: string, notes: string) {
  try {
    const admin = await requireAdmin();
    const result = await approveBrandApplicationAction(applicationId, notes, admin. id);
    
    if (result.success) {
      revalidatePath('/admin/brand-applications');
      revalidatePath('/brands');
      revalidatePath('/');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error. message };
  }
}

export async function rejectBrandApplication(applicationId: string, reason: string) {
  try {
    const admin = await requireAdmin();
    const result = await rejectBrandApplicationAction(applicationId, reason, admin.id);
    
    if (result.success) {
      revalidatePath('/admin/brand-applications');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}