import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://fragview.com';
// Use the main Logo.png (full-colour) — same file as used in the share snapshot
const LOGO_URL = `${BASE_URL}/Logo.png`;

// Logo display width; height is kept auto so the logo scales proportionally
const LOGO_WIDTH = 160;

// ===================================
// HELPER FUNCTION: Generate Logo HTML
// ===================================
// Renders the logo inside a cream (#FFF9EF) pill so it reads clearly against
// the dark #211F1C header.  Width is fixed; height is auto (proportional).
function getLogoHTML() {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 20px;">
      <tr>
        <td align="center" style="background:#FFF9EF;border-radius:16px;padding:14px 28px;">
          <img src="${LOGO_URL}" alt="FragView" width="${LOGO_WIDTH}" style="display:block;width:${LOGO_WIDTH}px;height:auto;max-width:100%;" />
        </td>
      </tr>
    </table>
  `;
}

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY CHECK #1: Verify cron secret from Vercel
    const authHeader = request.headers.get('authorization');
    
    // Check if CRON_SECRET is configured
    if (!process.env.CRON_SECRET) {
      console.error('❌ CRON_SECRET not configured! ');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Verify the authorization header matches
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('⚠️ Unauthorized cron attempt:', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent'),
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 🔒 SECURITY CHECK #2: Rate limit protection (prevent abuse even with valid secret)
    const lastRunKey = 'weekly-digest-last-run';
    const lastRun = global[lastRunKey as keyof typeof global] as number | undefined;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (lastRun && (now - lastRun) < oneHour) {
      console.warn('⚠️ Cron called too frequently');
      return NextResponse.json(
        { error: 'Cron job already ran recently. Please wait.' },
        { status: 429 }
      );
    }

    // Update last run time
    (global as any)[lastRunKey] = now;

    console.log('📬 Starting weekly digest job...');

    // Get users who want weekly digest
    const users = await prisma.user.findMany({
      where: {
        emailNotifWeeklyDigest: true,
        unsubscribedFromAll: false,
        emailVerified: { not: null }, // 🔒 Only send to verified emails
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    // Filter out users without valid email
    const usersWithEmail = users.filter(user => {
      if (!user.email) return false;
      // 🔒 Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(user.email);
    });

    console.log(`📧 Found ${usersWithEmail.length} users to send digest`);

    let sentCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const user of usersWithEmail) {
      try {
        // Get notifications from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const notifications = await prisma.notification.findMany({
          where: {
            userId: user.id,
            createdAt: { gte: sevenDaysAgo },
            testData: false, // 🔒 Exclude test data
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        // Get new reviews count from last 7 days
        const newReviewsCount = await prisma.review.count({
          where: {
            createdAt: { gte: sevenDaysAgo },
            isDeleted: false, // 🔒 Exclude deleted reviews
            testData: false, // 🔒 Exclude test data
          },
        });

        // Get unique perfumes reviewed (approximation for "new perfumes")
        const reviewedPerfumes = await prisma.review.findMany({
          where: {
            createdAt: { gte: sevenDaysAgo },
            isDeleted: false, // 🔒 Exclude deleted reviews
            testData: false, // 🔒 Exclude test data
          },
          select: {
            perfumeId: true,
          },
          distinct: ['perfumeId'],
        });

        const newPerfumesCount = reviewedPerfumes.length;

        // Skip if no activity
        if (notifications.length === 0 && newReviewsCount === 0) {
          console.log(`⏭️ Skipping ${user.email} - no activity`);
          continue;
        }

        // 🔒 SECURITY: Sanitize data before sending to email
        const sanitizedUsername = sanitizeForEmail(user.username);

        // Send email
        await sendWeeklyDigest(
          user.email! ,
          sanitizedUsername,
          notifications,
          newPerfumesCount,
          newReviewsCount
        );

        sentCount++;
        console.log(`✅ Sent digest to ${user.email}`);

        // 🔒 Rate limit between sends to avoid triggering email provider limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Failed to send to ${user.email}:`, error);
        errorCount++;
        errors.push(`${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`📊 Weekly digest complete: ${sentCount} sent, ${errorCount} errors`);

    // 🔒 Log errors for monitoring
    if (errors.length > 0) {
      console.error('📋 Error details:', errors);
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: usersWithEmail.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Weekly digest job failed:', error);
    
    // 🔒 Don't expose internal error details
    return NextResponse.json(
      { error: 'Failed to run weekly digest' },
      { status: 500 }
    );
  }
}

// 🔒 HELPER: Sanitize data for email display
function sanitizeForEmail(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 100); // Limit length
}

async function sendWeeklyDigest(
  email: string,
  username: string,
  notifications: any[],
  newPerfumes: number,
  newReviews: number
) {
  const unsubscribeUrl = `${BASE_URL}/settings#notifications`;

  const notificationsList = notifications
    .slice(0, 10)
    .map((notif) => {
      const icon = getNotifIcon(notif.type);
      const date = new Date(notif.createdAt);
      // 🔒 Sanitize notification message
      const safeMessage = sanitizeForEmail(notif.message);
      
      return `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f3f4f6;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td width="40" style="vertical-align:top;">
                  <span style="font-size:24px;">${icon}</span>
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 4px 0;color:#1f2937;font-size:14px;line-height:1.5;">
                    ${safeMessage}
                  </p>
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Digest</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#FFF9EF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF9EF;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
          
          <!-- Header with Professional Logo -->
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:#211F1C;border-radius:16px 16px 0 0;">
              ${getLogoHTML()}
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;text-align:center;">
                📬 Your Weekly Digest
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;text-align:center;">
                What happened this week on FragView
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;">
                Hi <strong style="color:#211F1C;">${username}</strong>,
              </p>
              
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                Here's your weekly summary of activity on FragView:
              </p>

              <!-- Stats Grid -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td width="48%" style="padding:16px;background:#FFF9EF;border:1px solid #ECE0CF;border-radius:8px;vertical-align:top;">
                    <p style="margin:0 0 4px 0;color:#6b7280;font-size:12px;text-align:center;">New Perfumes</p>
                    <p style="margin:0;color:#1f2937;font-size:24px;font-weight:700;text-align:center;">${newPerfumes}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding:16px;background:#FFF9EF;border:1px solid #ECE0CF;border-radius:8px;vertical-align:top;">
                    <p style="margin:0 0 4px 0;color:#6b7280;font-size:12px;text-align:center;">New Reviews</p>
                    <p style="margin:0;color:#1f2937;font-size:24px;font-weight:700;text-align:center;">${newReviews}</p>
                  </td>
                </tr>
              </table>

              <!-- Your Activity -->
              <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">
                Your Activity (${notifications.length})
              </h3>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                ${notificationsList}
              </table>

              ${notifications.length > 10 ? `
              <p style="margin:16px 0 0 0;text-align:center;">
                <a href="${BASE_URL}/notifications" style="color:#B28845;text-decoration:none;font-size:14px;font-weight:600;">
                  View all ${notifications.length} notifications →
                </a>
              </p>
              ` : ''}

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:#211F1C;">
                    <a href="${BASE_URL}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                      Explore FragView
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;color:#6b7280;font-size:14px;line-height:1.6;text-align:center;">
                Keep discovering amazing fragrances!  🌸
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 30px;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 12px 0;color:#6b7280;font-size:12px;line-height:1.5;text-align:center;">
                <a href="${unsubscribeUrl}" style="color:#B28845;text-decoration:none;">Email Preferences</a>
                •
                <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:none;">Unsubscribe from Digest</a>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;">
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

  await resend.emails.send({
    from: 'FragView <digest@fragview.com>',
    to: email,
    subject: `Your FragView Weekly Digest - ${notifications.length} updates`,
    html,
  });
}

function getNotifIcon(type: string): string {
  const icons: Record<string, string> = {
    NEW_FOLLOWER: '👤',
    FOLLOW_REQUEST: '🙋',
    FOLLOW_APPROVED: '✅',
    BRAND_NEW_RELEASE: '🆕',
    REVIEW_HELPFUL: '👍',
    REVIEW_LIKE: '❤️',
    REVIEW_REPLY: '💬',
    THREAD_ACTIVITY: '🔔',
    SUBMISSION_APPROVED: '✅',
    SUBMISSION_REJECTED: '❌',
    SYSTEM_ANNOUNCEMENT: '📢',
  };
  return icons[type] || '🔔';
}