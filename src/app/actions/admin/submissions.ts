'use server';

import { requireAdmin } from '@/lib/admin/permissions';
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from '@/lib/admin/submissions';
import { revalidatePath } from 'next/cache';

export async function approveSubmission(
  submissionId: string,
  data: any,
  notes: string
) {
  try {
    const admin = await requireAdmin();
    const result = await approveSubmissionAction(submissionId, data, notes, admin.id);
    
    if (result.success) {
      revalidatePath('/admin/submissions');
      revalidatePath('/');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectSubmission(submissionId: string, reason: string) {
  try {
    const admin = await requireAdmin();
    const result = await rejectSubmissionAction(submissionId, reason, admin.id);
    
    if (result.success) {
      revalidatePath('/admin/submissions');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}