import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email';
import { Resend } from 'resend';

const resend = new Resend(process.env. RESEND_API_KEY);

const BASE_URL = process.env. NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://fragview.com';
const LOGO_URL = `${BASE_URL}/logo-white.png`;

// 🎨 LOGO SIZE OPTIONS - Uncomment ONE option to test
// ============================================

// OPTION 1: LARGE (Recommended - Good balance)
const LOGO_CONFIG = {
  width: 100,
  height: 100,
  containerWidth: 140,
  containerHeight: 140,
  containerMargin: 20 // margin below logo
};

// OPTION 2: MEDIUM (Subtle, elegant)
// const LOGO_CONFIG = {
//   width: 80,
//   height: 80,
//   containerWidth: 120,
//   containerHeight: 120,
//   containerMargin: 20
// };

// OPTION 3: EXTRA LARGE (Bold, maximum impact)
// const LOGO_CONFIG = {
//   width: 140,
//   height: 140,
//   containerWidth: 180,
//   containerHeight: 180,
//   containerMargin: 24
// };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email } = body;

    if (!email) {
      return NextResponse. json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`📧 Sending ${type} test email to: ${email}`);
    console.log(`🖼️ Logo: ${LOGO_CONFIG.width}x${LOGO_CONFIG.height} in ${LOGO_CONFIG.containerWidth}x${LOGO_CONFIG. containerHeight} container`);

    switch (type) {
      case 'welcome':
        await sendTestWelcomeEmail(email, 'TestUser');
        break;
        
      case 'verification':
        await sendTestVerificationEmail(email, 'TestUser');
        break;
        
      case 'password-reset':
        await sendTestPasswordResetEmail(email, 'TestUser');
        break;
        
      case 'weekly-digest':
        await sendTestWeeklyDigest(email, 'TestUser');
        break;
        
      default:
        return NextResponse. json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} email sent successfully to ${email}`,
      logoSize: `${LOGO_CONFIG.width}x${LOGO_CONFIG.height}`
    });
  } catch (error: any) {
    console.error('❌ Send test email error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send email' 
    }, { status: 500 });
  }
}

// ===================================
// HELPER FUNCTION: Generate Logo HTML
// ===================================
function getLogoHTML() {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="width:${LOGO_CONFIG.containerWidth}px;height:${LOGO_CONFIG.containerHeight}px;margin:0 auto ${LOGO_CONFIG.containerMargin}px;background:rgba(255,255,255,0.25);border-radius:50%;box-shadow:0 8px 32px rgba(0,0,0,0.1);border:2px solid rgba(255,255,255,0.3);">
          <img src="${LOGO_URL}" alt="FragView" width="${LOGO_CONFIG.width}" height="${LOGO_CONFIG.height}" style="display:block;margin:${(LOGO_CONFIG.containerHeight - LOGO_CONFIG.height) / 2}px auto;" />
        </td>
      </tr>
    </table>
  `;
}

// ===================================
// TEST VERIFICATION EMAIL
// ===================================
async function sendTestVerificationEmail(email: string, username: string) {
  const verificationUrl = `${BASE_URL}/verify-email?token=test-token-123456`;

  const html = `
<! DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1. 0">
  <title>Verify your FragView account</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:linear-gradient(135deg,#10b981 0%,#f97316 100%);border-radius:16px 16px 0 0;">
              ${getLogoHTML()}
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;text-align:center;">
                Verify Your Email
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 10px;color:#1f2937;font-size:18px;font-weight:600;">
                Hi ${username}!  👋
              </p>
              
              <p style="margin:0 0 24px;color:#6b7280;font-size:16px;line-height:1.6;">
                Thank you for joining FragView, the fragrance community.  To get started discovering amazing scents, please verify your email address.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:30px 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:linear-gradient(135deg,#10b981 0%,#f97316 100%);">
                    <a href="${verificationUrl}" target="_blank" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin:30px 0 10px;color:#6b7280;font-size:14px;line-height:1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 30px;color:#10b981;font-size:13px;word-break:break-all;background:#f3f4f6;padding:12px;border-radius:6px;">
                ${verificationUrl}
              </p>
              
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">
              
              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1. 6;">
                ⏱️ This link will expire in <strong>24 hours</strong>. <br>
                If you didn't create a FragView account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#f9fafb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                Need help? Contact us at <a href="mailto:support@fragview.com" style="color:#10b981;text-decoration:none;">support@fragview.com</a>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} FragView. All rights reserved. 
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

  await resend.emails. send({
    from: 'FragView <noreply@fragview.com>',
    to: email,
    subject: 'Verify your FragView account',
    html,
  });
}

// ===================================
// TEST WELCOME EMAIL
// ===================================
async function sendTestWelcomeEmail(email: string, username: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FragView</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:linear-gradient(135deg,#10b981 0%,#f97316 100%);border-radius:16px 16px 0 0;">
              ${getLogoHTML()}
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;text-align:center;">
                Welcome to FragView!
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:16px;text-align:center;">
                Your fragrance journey starts here
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 10px;color:#1f2937;font-size:20px;font-weight:600;">
                Hi ${username}!  🎉
              </p>
              
              <p style="margin:0 0 24px;color:#6b7280;font-size:16px;line-height:1. 6;">
                Your email has been verified and your account is now active. Welcome to the FragView community!
              </p>
              
              <!-- Feature Cards -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:linear-gradient(135deg,#d1fae5 0%,#fed7aa 100%);border-radius:12px;padding:24px;margin:24px 0;">
                <tr>
                  <td>
                    <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">Get Started:</h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding:8px 0;color:#374151;font-size:15px;">
                          <span style="font-size:20px;margin-right:8px;">📝</span>
                          Write your first perfume review
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#374151;font-size:15px;">
                          <span style="font-size:20px;margin-right:8px;">👃</span>
                          Explore 166,000+ perfumes from 14,000+ brands
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#374151;font-size:15px;">
                          <span style="font-size:20px;margin-right:8px;">💼</span>
                          Build your perfume wardrobe
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#374151;font-size:15px;">
                          <span style="font-size:20px;margin-right:8px;">👥</span>
                          Follow other fragrance enthusiasts
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#374151;font-size:15px;">
                          <span style="font-size:20px;margin-right:8px;">🏆</span>
                          Earn XP and unlock badges
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:linear-gradient(135deg,#10b981 0%,#f97316 100%);">
                    <a href="${BASE_URL}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                      Start Exploring
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.6;text-align:center;">
                Happy fragrance hunting! 🌸<br>
                <strong style="color:#10b981;">The FragView Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#f9fafb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                Need help? Contact us at <a href="mailto:support@fragview.com" style="color:#10b981;text-decoration:none;">support@fragview.com</a>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} FragView. All rights reserved.
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
    from: 'FragView <noreply@fragview.com>',
    to: email,
    subject: 'Welcome to FragView!  🎉',
    html,
  });
}

// ===================================
// TEST PASSWORD RESET EMAIL
// ===================================
async function sendTestPasswordResetEmail(email: string, username: string) {
  const resetUrl = `${BASE_URL}/reset-password?code=TESTRESET123`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:linear-gradient(135deg,#10b981 0%,#f97316 100%);border-radius:16px 16px 0 0;">
              ${getLogoHTML()}
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;text-align:center;">
                Password Reset
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 10px;color:#1f2937;font-size:18px;font-weight:600;">
                Hi ${username},
              </p>
              
              <p style="margin:0 0 24px;color:#6b7280;font-size:16px;line-height:1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:30px 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:linear-gradient(135deg,#10b981 0%,#f97316 100%);">
                    <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Reset Code Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">
                      Or use this code:
                    </p>
                    <p style="margin:0;color:#10b981;font-size:28px;font-weight:700;letter-spacing:6px;">
                      TESTRESET123
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin:20px 0 10px;color:#6b7280;font-size:14px;line-height:1.6;">
                Or copy and paste this link:
              </p>
              <p style="margin:0 0 30px;color:#10b981;font-size:13px;word-break:break-all;background:#f3f4f6;padding:12px;border-radius:6px;">
                ${resetUrl}
              </p>
              
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">
              
              <!-- Security Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:4px;margin:20px 0;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;color:#991b1b;font-size:14px;font-weight:600;">
                      ⚠️ Security Notice
                    </p>
                    <p style="margin:0;color:#7f1d1d;font-size:13px;line-height:1. 6;">
                      This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email.  Your password will remain unchanged.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#f9fafb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                Need help? Contact us at <a href="mailto:support@fragview. com" style="color:#10b981;text-decoration:none;">support@fragview.com</a>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} FragView. All rights reserved.
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

  await resend. emails.send({
    from: 'FragView <noreply@fragview.com>',
    to: email,
    subject: 'Reset your FragView password',
    html,
  });
}

// ===================================
// TEST WEEKLY DIGEST EMAIL
// ===================================
async function sendTestWeeklyDigest(email: string, username: string) {
  const notifications = [
    { icon: '👤', message: '@JohnDoe started following you', date: '2 days ago' },
    { icon: '👍', message: '@SarahSmith found your review helpful', date: '3 days ago' },
    { icon: '💬', message: '@MikeJohnson mentioned you in a review', date: '5 days ago' },
    { icon: '🔔', message: '@EmilyBrown posted on a thread you follow', date: '6 days ago' },
  ];

  const notifRows = notifications.map(n => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f3f4f6;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="40"><span style="font-size:24px;">${n.icon}</span></td>
            <td>
              <p style="margin:0 0 4px;color:#1f2937;font-size:14px;">${n.message}</p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">${n.date}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Digest</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:linear-gradient(135deg,#10b981 0%,#f97316 100%);border-radius:16px 16px 0 0;">
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
                Hi <strong style="color:#10b981;">${username}</strong>,
              </p>
              
              <!-- Stats -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td width="48%" style="padding:16px;background:linear-gradient(135deg,#d1fae5 0%,#fed7aa 100%);border-radius:8px;vertical-align:top;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-align:center;">New Perfumes</p>
                    <p style="margin:0;color:#1f2937;font-size:24px;font-weight:700;text-align:center;">15</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding:16px;background:linear-gradient(135deg,#fef3c7 0%,#ddd6fe 100%);border-radius:8px;vertical-align:top;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-align:center;">New Reviews</p>
                    <p style="margin:0;color:#1f2937;font-size:24px;font-weight:700;text-align:center;">342</p>
                  </td>
                </tr>
              </table>
              
              <!-- Notifications -->
              <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">Your Activity (4)</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                ${notifRows}
              </table>
              
              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:linear-gradient(135deg,#10b981 0%,#f97316 100%);">
                    <a href="${BASE_URL}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                      Explore FragView
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 30px;background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 12px;color:#6b7280;font-size:12px;text-align:center;">
                <a href="${BASE_URL}/settings" style="color:#10b981;text-decoration:none;">Email Preferences</a>
                •
                <a href="${BASE_URL}/settings" style="color:#9ca3af;text-decoration:none;">Unsubscribe</a>
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
    subject: `Your FragView Weekly Digest - 4 updates`,
    html,
  });
}