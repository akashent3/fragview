import prisma from '@/lib/prisma';

export async function getFollowStatus(followerId: string, followingId: string) {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });

  if (!follow) return 'none';
  return follow.status.toLowerCase() as 'pending' | 'approved';
}