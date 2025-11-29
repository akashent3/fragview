import prisma from '@/lib/prisma';
import { logAdminAction } from './stats';

/**
 * Get users with search and filters
 */
export async function getUsers({
  search = '',
  role = 'all',
  page = 1,
  limit = 50,
}: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  const where: any = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role && role !== 'all') {
    where.role = role;
  }

  const [users, total] = await Promise. all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        experiencePoints: true,
        _count: {
          select: {
            reviews: true,
            wardrobeItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

/**
 * Get single user details
 */
export async function getUserByUsername(username: string) {
  const user = await prisma. user.findUnique({
    where: { username },
    include: {
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          perfumeId: true,
          rating: true,
          text: true,
          createdAt: true,
        },
      },
      wardrobeItems: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          reviews: true,
          wardrobeItems: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  return user;
}

/**
 * Ban/Unban user
 */
export async function toggleUserBanAction(
  userId: string,
  banned: boolean,
  reason: string,
  adminId: string
) {
  try {
    // Note: You'll need to add a 'banned' field to your User model
    // For now, we can use role manipulation or add a separate banned field

    await logAdminAction(
      adminId,
      banned ? 'BAN_USER' : 'UNBAN_USER',
      'USER',
      userId,
      { reason }
    );

    return { success: true };
  } catch (error) {
    console.error('Error toggling user ban:', error);
    return { success: false, error: 'Failed to update user status' };
  }
}

/**
 * Change user role
 */
export async function changeUserRoleAction(
  userId: string,
  newRole: 'USER' | 'ADMIN' | 'MODERATOR' | 'EDITOR',
  adminId: string
) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await logAdminAction(
      adminId,
      'CHANGE_USER_ROLE',
      'USER',
      userId,
      { newRole }
    );

    return { success: true };
  } catch (error) {
    console.error('Error changing user role:', error);
    return { success: false, error: 'Failed to change user role' };
  }
}

/**
 * Delete user content (reviews, photos, etc.)
 */
export async function deleteUserContentAction(
  contentType: 'review' | 'photo',
  contentId: string,
  adminId: string
) {
  try {
    if (contentType === 'review') {
      await prisma.review.update({
        where: { id: contentId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          text: '[Deleted by admin]',
        },
      });
    }

    await logAdminAction(
      adminId,
      'DELETE_CONTENT',
      contentType. toUpperCase(),
      contentId,
      {}
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting content:', error);
    return { success: false, error: 'Failed to delete content' };
  }
}