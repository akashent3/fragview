import prisma from '@/lib/prisma';
import { logAdminAction } from './stats';
import { revalidatePath } from 'next/cache';
import { generateSlug as genSlug, calculateReadTime as calcReadTime } from '@/lib/utils/article-utils';

/**
 * Get all articles with filters
 */
export async function getArticles({
  published,
  category,
  authorId,
}: {
  published?: boolean;
  category?: string;
  authorId?: string;
} = {}) {
  const where: any = {};

  if (published !== undefined) {
    where.published = published;
  }

  if (category && category !== 'all') {
    where.category = category;
  }

  if (authorId) {
    where.authorId = authorId;
  }

  const articles = await prisma. article.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return articles;
}

/**
 * Get single article by ID
 */
export async function getArticleById(id: string) {
  const article = await prisma.article. findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
          role: true,
        },
      },
    },
  });

  return article;
}

/**
 * Get article by slug (for public view)
 */
export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
          bio: true,
        },
      },
    },
  });

  return article;
}

/**
 * Create new article
 */
export async function createArticle(
  data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    category: string;
    readTime: string;
    mentionedPerfumes: string[];
    published: boolean;
  },
  authorId: string
) {
  try {
    // Check if slug already exists
    const existing = await prisma.article.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return { success: false, error: 'Slug already exists.  Please use a unique slug.' };
    }

    const article = await prisma.article. create({
      data: {
        ...data,
        authorId,
        publishedAt: data.published ? new Date() : null,
      },
    });

    // Log admin action
    await logAdminAction(
      authorId,
      'CREATE_ARTICLE',
      'ARTICLE',
      article.id,
      { title: data.title, published: data.published }
    );

    revalidatePath('/drydown');
    revalidatePath('/admin/drydown');

    return { success: true, article };
  } catch (error) {
    console.error('Error creating article:', error);
    return { success: false, error: 'Failed to create article' };
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
  },
  userId: string
) {
  try {
    // If slug is being changed, check for duplicates
    if (data.slug) {
      const existing = await prisma.article.findFirst({
        where: {
          slug: data.slug,
          NOT: { id: articleId },
        },
      });

      if (existing) {
        return { success: false, error: 'Slug already exists. Please use a unique slug.' };
      }
    }

    // If publishing for the first time, set publishedAt
    const currentArticle = await prisma.article. findUnique({
      where: { id: articleId },
    });

    const updateData: any = { ...data };

    if (data.published && ! currentArticle?.published) {
      updateData.publishedAt = new Date();
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
    });

    // Log admin action
    await logAdminAction(
      userId,
      'UPDATE_ARTICLE',
      'ARTICLE',
      articleId,
      { title: data.title }
    );

    revalidatePath('/drydown');
    revalidatePath(`/drydown/${article.slug}`);
    revalidatePath('/admin/drydown');

    return { success: true, article };
  } catch (error) {
    console.error('Error updating article:', error);
    return { success: false, error: 'Failed to update article' };
  }
}

/**
 * Delete article
 */
export async function deleteArticle(articleId: string, userId: string) {
  try {
    const article = await prisma.article. delete({
      where: { id: articleId },
    });

    // Log admin action
    await logAdminAction(
      userId,
      'DELETE_ARTICLE',
      'ARTICLE',
      articleId,
      { title: article.title }
    );

    revalidatePath('/drydown');
    revalidatePath('/admin/drydown');

    return { success: true };
  } catch (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: 'Failed to delete article' };
  }
}

export const generateSlug = genSlug;
export const calculateReadTime = calcReadTime;