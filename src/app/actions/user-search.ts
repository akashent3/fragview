'use server';

import prisma from '@/lib/prisma';

export type UserSearchResult = {
  id: string;
  username: string;
  image: string | null;
  experiencePoints: number;
};

export async function searchUsersForMention(query: string): Promise<UserSearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 5,
      select: {
        id: true,
        username: true,
        image: true,
        experiencePoints: true,
      },
    });

    return users;
  } catch (error) {
    console.error('User search error:', error);
    return [];
  }
}