import prisma from '@/lib/prisma';

/**
 * Get analytics data
 */
export async function getAnalytics() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User growth
    const [dailyUsers, weeklyUsers, monthlyUsers] = await Promise.all([
      prisma.user. count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma. user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: oneMonthAgo } } }),
    ]);

    // Top reviewers
    const topReviewers = await prisma.user.findMany({
      select: {
        username: true,
        experiencePoints: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: {
        reviews: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Top perfumes (most reviewed)
    const perfumeReviewCounts = await prisma. review.groupBy({
      by: ['perfumeId'],
      _count: {
        id: true,
      },
      _avg: {
        rating: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Note: You'd need to fetch perfume details from MongoDB here
    // For now, returning placeholder structure
    const topPerfumes = perfumeReviewCounts.map(p => ({
      name: `Perfume ${p.perfumeId. slice(0, 8)}`,
      brandName: 'Brand Name',
      reviewCount: p._count.id,
      avgRating: p._avg.rating || 0,
    }));

    // System health (mock data - implement real metrics)
    const systemHealth = {
      dbSize: '2. 4 GB',
      totalStorage: '5.8 GB',
      avgResponseTime: '180ms',
    };

    return {
      userGrowth: {
        daily: dailyUsers,
        weekly: weeklyUsers,
        monthly: monthlyUsers,
      },
      topReviewers: topReviewers. map(r => ({
        username: r.username,
        reviewCount: r._count.reviews,
        xp: r.experiencePoints,
      })),
      topPerfumes,
      systemHealth,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      userGrowth: { daily: 0, weekly: 0, monthly: 0 },
      topReviewers: [],
      topPerfumes: [],
      systemHealth: {
        dbSize: 'N/A',
        totalStorage: 'N/A',
        avgResponseTime: 'N/A',
      },
    };
  }
}