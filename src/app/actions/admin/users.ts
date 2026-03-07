'use server';

import { requireAdmin } from '@/lib/admin/permissions';
import { changeUserRoleAction } from '@/lib/admin/users';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: 'USER' | 'ADMIN' | 'MODERATOR' | 'EDITOR') {
  try {
    const session = await requireAdmin(); // Ensures safety
    
    await changeUserRoleAction(userId, newRole, session.id);
    
    // Refresh the page so the new role shows up immediately
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/[username]`);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update role:', error);
    return { success: false, error: 'Failed to update role' };
  }
}

