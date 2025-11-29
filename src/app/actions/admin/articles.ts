'use server';

import { auth } from '@/lib/auth';
import {
  createArticle as createArticleLib,
  updateArticle as updateArticleLib,
  deleteArticle as deleteArticleLib,
} from '@/lib/admin/articles';
import { revalidatePath } from 'next/cache';

/**
 * Create new article
 */
export async function createArticle(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  readTime: string;
  mentionedPerfumes: string[];
  published: boolean;
}) {
  try {
    const session = await auth();
    
    if (!session?. user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is ADMIN or EDITOR
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return { success: false, error: 'You do not have permission to create articles' };
    }

    const result = await createArticleLib(data, session.user.id);
    
    if (result.success) {
      revalidatePath('/admin/drydown');
      revalidatePath('/drydown');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update article
 */
export async function updateArticle(
  articleId: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    category?: string;
    readTime?: string;
    mentionedPerfumes?: string[];
    published?: boolean;
  }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is ADMIN or EDITOR
    if (session.user. role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return { success: false, error: 'You do not have permission to edit articles' };
    }

    const result = await updateArticleLib(articleId, data, session. user.id);
    
    if (result.success) {
      revalidatePath('/admin/drydown');
      revalidatePath('/drydown');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete article
 */
export async function deleteArticle(articleId: string) {
  try {
    const session = await auth();
    
    if (! session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is ADMIN
    if (session.user.role !== 'ADMIN') {
      return { success: false, error: 'Only admins can delete articles' };
    }

    const result = await deleteArticleLib(articleId, session.user.id);
    
    if (result.success) {
      revalidatePath('/admin/drydown');
      revalidatePath('/drydown');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error. message };
  }
}