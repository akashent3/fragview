'use server';

import prisma from '@/lib/prisma';
import { getPerfumesBySlugs } from '@/lib/data/perfumes';

// 1. Fetch Latest Articles with Pagination
export async function getArticles(category?: string, page: number = 1, limit: number = 9) {
  const skip = (page - 1) * limit;

  const where = {
    published: true,
    ...(category && category !== 'All' ?  { category } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma. article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: {
            username: true,
            image: true,
            badges: true,
          },
        },
        _count: {
          select: {
            comments: true, // Get comment count
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }), // Total count for pagination
  ]);

  // Map username to name for frontend consistency
  return {
    articles: articles.map((a) => ({
      ...a,
      author: {
        ... a.author,
        name: a.author.username,
      },
      commentCount: a._count.comments,
    })),
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
}

// 2.  Fetch Single Article with Sidebar Data
export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          username: true,
          image: true,
          badges: true,
          bio: true,
        },
      },
    },
  });

  if (! article) return null;

  // Fetch the perfume details from MongoDB for the sidebar
  const mentionedPerfumes = await getPerfumesBySlugs(article.mentionedPerfumes);

  return {
    article: {
      ...article,
      author: {
        ...article. author,
        name: article. author.username,
      },
    },
    mentionedPerfumes,
  };
}