import prisma from './prisma';
import { Resend } from 'resend';
import { NotificationType } from '@prisma/client';

// Initialize Resend directly here (same pattern as email. ts)
const resend = new Resend(process.env. RESEND_API_KEY);
const BASE_URL = process.env. NEXTAUTH_URL || process.env. NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// ✅ Logo paths from /public folder
const LOGO_WHITE_URL = `${BASE_URL}/logo-white.svg`;

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
  sendEmail?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Create in-app notification
 * Note: Emails are ONLY sent for: Welcome, Email Verification, Password Reset, Weekly Digest
 * All other notifications are IN-APP ONLY (no email)
 */
export async function createNotification({
  userId,
  type,
  message,
  link,
  sendEmail = false, // ✅ Changed default to false - no emails by default
  metadata,
}: CreateNotificationParams) {
  try {
    // Create in-app notification (always)
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link,
        read: false,
      },
    });

    // ✅ NOTE: Emails are NOT sent from here anymore
    // Only Welcome, Email Verification, Password Reset, Weekly Digest emails exist
    // Those are sent directly from their respective functions in /lib/email.ts

    return { success: true, notification };
  } catch (error) {
    console.error('Failed to create notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

/**
 * Get email subject line for notification type
 * (Only used for reference, actual emails sent from /lib/email.ts)
 */
function getEmailSubject(type: NotificationType): string {
  const subjects: Record<NotificationType, string> = {
    NEW_FOLLOWER: '👥 You have a new follower on FragView',
    FOLLOW_REQUEST: '🤝 Someone wants to follow you on FragView', // ✅ ADD THIS
    FOLLOW_APPROVED: '✅ Your follow request was approved', // ✅ ADD THIS
    BRAND_NEW_RELEASE: '🎉 New perfume from a brand you follow', // ✅ ADD THIS
    REVIEW_HELPFUL: '👍 Your review was marked helpful',
    REVIEW_LIKE: '❤️ Someone liked your review',
    REVIEW_REPLY: '💬 Someone mentioned you in a review',
    THREAD_ACTIVITY: '🔔 New activity on a thread you follow',
    SUBMISSION_APPROVED: '✅ Your submission was approved',
    SUBMISSION_REJECTED: '❌ Your submission needs attention',
    SYSTEM_ANNOUNCEMENT: '📢 Important update from FragView',
  };
  return subjects[type] || '🔔 New notification from FragView';
}

/**
 * Beautiful email template with botanical theme and logo
 * (Only used for reference, actual emails sent from /lib/email.ts)
 */
function getEmailTemplate(
  username: string,
  message: string,
  link?: string,
  type?: NotificationType
): string {
  const unsubscribeUrl = `${BASE_URL}/settings#notifications`;

  return `
<! DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FragView Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #FAFFF5 0%, #F0FDF4 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
              <img src="${LOGO_WHITE_URL}" alt="FragView Logo" width="100" height="100" style="display: block; margin: 0 auto 16px;" />
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
                FragView
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #10b981;">${username}</strong>,
              </p>
              
              <div style="background: linear-gradient(135deg, #d1fae5 0%, #fed7aa 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                  ${message}
                </p>
              </div>

              ${
                link
                  ? `
              <div style="text-align: center; margin: 32px 0;">
                <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #f97316 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  View on FragView
                </a>
              </div>
              `
                  : ''
              }

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Keep discovering amazing fragrances! <br>
                <strong style="color: #10b981;">The FragView Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center;">
                <a href="${unsubscribeUrl}" style="color: #10b981; text-decoration: none;">Notification Settings</a>
                •
                <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: none;">Manage Preferences</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                FragView • Your trusted fragrance community
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

/**
 * Mark single notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId, // Security check
      },
      data: {
        read: true,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to mark as read' };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to mark all as read' };
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(userId: string) {
  try {
    await prisma.notification.deleteMany({
      where: {
        userId,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to clear notifications' };
  }
}

/**
 * Extract @mentions from text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return Array.from(new Set(mentions)); // Remove duplicates
}