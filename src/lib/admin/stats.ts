import prisma from '@/lib/prisma';
import { connectMongoDB } from '@/lib/mongodb';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    // PostgreSQL stats
    const [
      totalUsers,
      totalReviews,
      totalNotifications,
      pendingSubmissions,
      pendingBrandApplications,
      totalWardrobeItems,
      recentUsers,
      activeUsers,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total reviews
      prisma.review.count(),

      // Total notifications
      prisma.notification.count(),

      // Pending community submissions
      prisma.communitySubmission.count({
        where: { status: 'PENDING' },
      }),

      // Pending brand owner applications
      prisma.brandOwnerSubmission.count({
        where: { status: 'PENDING' },
      }),

      // Total wardrobe items
      prisma.wardrobeEntry.count(),

      // New users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Active users (last 30 days - users with reviews or wardrobe activity)
      prisma.user.count({
        where: {
          OR: [
            {
              reviews: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
            {
              wardrobe: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
          ],
        },
      }),
    ]);

    // MongoDB stats
    const { db } = await connectMongoDB();
    const [totalPerfumes, totalBrands] = await Promise.all([
      db.collection('perfumes').countDocuments(),
      db.collection('brands').countDocuments(),
    ]);

    return {
      users: {
        total: totalUsers,
        recent: recentUsers,
        active: activeUsers,
      },
      content: {
        perfumes: totalPerfumes,
        brands: totalBrands,
        reviews: totalReviews,
        wardrobeItems: totalWardrobeItems,
      },
      pending: {
        submissions: pendingSubmissions,
        brandApplications: pendingBrandApplications,
        total: pendingSubmissions + pendingBrandApplications,
      },
      notifications: totalNotifications,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Get recent activity
 */
export async function getRecentActivity(limit = 10) {
  const activities = await prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          username: true,
          image: true,
        },
      },
    },
  });

  return activities;
}

/**
 * Log admin action
 */
export async function logAdminAction(
  userId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: any
) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      targetType,
      targetId,
      details,
    },
  });
}