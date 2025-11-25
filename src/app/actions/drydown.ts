'use server';

import prisma from '@/lib/prisma';
import { getPerfumesBySlugs } from '@/lib/data/perfumes';

// 1. Fetch Latest Articles
export async function getArticles(category?: string) {
  const where = {
    published: true,
    ...(category ? { category } : {})
  };

  const articles = await prisma.article.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    include: {
      author: {
        select: {
          username: true, // Use username as name fallback
          image: true,
          badges: true
        }
      }
    },
    take: 20
  });

  // Map username to name for frontend consistency
  return articles.map(a => ({
    ...a,
    author: {
      ...a.author,
      name: a.author.username
    }
  }));
}

// 2. Fetch Single Article with Sidebar Data
export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          username: true,
          image: true,
          badges: true,
          bio: true
        }
      }
    }
  });

  if (!article) return null;

  // Fetch the perfume details from MongoDB for the sidebar
  const mentionedPerfumes = await getPerfumesBySlugs(article.mentionedPerfumes);

  return {
    article: {
      ...article,
      author: {
        ...article.author,
        name: article.author.username
      }
    },
    mentionedPerfumes
  };
}