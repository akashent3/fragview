import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
}

/**
 * Create a single notification for a user
 */
export async function createNotification({
  userId,
  type,
  message,
  link,
}: CreateNotificationParams) {
  try {
    await prisma.notification. create({
      data: {
        userId,
        type,
        message,
        link,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

/**
 * Notify user when someone follows them
 */
export async function notifyNewFollower(followedUserId: string, followerUsername: string) {
  await createNotification({
    userId: followedUserId,
    type: 'NEW_FOLLOWER',
    message: `${followerUsername} started following you`,
    link: `/u/${followerUsername}`,
  });
}

/**
 * Notify user when their review receives a helpful vote
 */
export async function notifyReviewHelpful(
  reviewAuthorId: string, 
  voterUsername: string, 
  perfumeSlug: string,
  perfumeName: string
) {
  await createNotification({
    userId: reviewAuthorId,
    type: 'REVIEW_HELPFUL',
    message: `${voterUsername} found your review of "${perfumeName}" helpful`,
    link: `/perfumes/${perfumeSlug}#reviews`,
  });
}

/**
 * Notify user when their review receives a like
 */
export async function notifyReviewLike(
  reviewAuthorId: string,
  likerUsername: string,
  perfumeSlug: string,
  perfumeName: string
) {
  await createNotification({
    userId: reviewAuthorId,
    type: 'REVIEW_LIKE',
    message: `${likerUsername} liked your review of "${perfumeName}"`,
    link: `/perfumes/${perfumeSlug}#reviews`,
  });
}

/**
 * Notify user when their submission is approved
 */
export async function notifySubmissionApproved(
  userId: string,
  submissionType: 'brand' | 'perfume',
  itemName: string
) {
  await createNotification({
    userId,
    type: 'SUBMISSION_APPROVED',
    message: `Your ${submissionType} submission "${itemName}" has been approved! `,
    link: submissionType === 'brand' ? `/brands` : `/perfumes`,
  });
}

/**
 * Notify user when their submission is rejected
 */
export async function notifySubmissionRejected(
  userId: string,
  submissionType: 'brand' | 'perfume',
  itemName: string,
  reason?: string
) {
  const message = reason
    ? `Your ${submissionType} submission "${itemName}" was not approved: ${reason}`
    : `Your ${submissionType} submission "${itemName}" was not approved.`;

  await createNotification({
    userId,
    type: 'SUBMISSION_REJECTED',
    message,
  });
}

/**
 * Send system-wide announcement to all users
 */
export async function sendSystemAnnouncement(message: string, link?: string) {
  try {
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    await Promise.all(
      allUsers.map(u =>
        createNotification({
          userId: u.id,
          type: 'SYSTEM_ANNOUNCEMENT',
          message,
          link,
        })
      )
    );
  } catch (error) {
    console.error('Failed to send system announcement:', error);
  }
}