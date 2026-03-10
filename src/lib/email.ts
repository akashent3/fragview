import { Resend } from 'resend';

const resend = new Resend(process. env.RESEND_API_KEY);

const BASE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://fragview.com';
// Use the main Logo.png (full-colour) — same file as used in the share snapshot
const LOGO_URL = `${BASE_URL}/Logo.png`;

// Logo display width; height is kept auto so the logo scales proportionally
const LOGO_WIDTH = 160;

console.log('📧 Email configuration:');
console.log('   Base URL:', BASE_URL);
console.log('   Logo URL:', LOGO_URL);

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

// ===================================
// VERIFICATION EMAIL
// ===================================
export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
) {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;

  console.log('📧 Attempting to send verification email.. .');
  console.log('   To:', email);
  console.log('   Username:', username);
  console.log('   Token:', token. substring(0, 10) + '...');
  console.log('   URL:', verificationUrl);
  console.log('   Logo URL:', LOGO_URL);
  console.log('   API Key exists:', !!process.env. RESEND_API_KEY);

  try {
    const { data: result } = await resend.emails. send({
      from: 'FragView <noreply@fragview.com>',
      to: email,
      subject: 'Verify your FragView account',
      html: getVerificationEmailTemplate(username, verificationUrl),
    });
    
    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', result?. id);
    console.log('   Data:', result);
    
    return result;
    
  } catch (error: any) {
    console.error('❌ FAILED to send verification email! ');
    console.error('   Error type:', error?. constructor?.name);
    console.error('   Error message:', error?.message);
    console.error('   Full error:', error);
    
    throw error;
  }
}

function getVerificationEmailTemplate(username: string, verificationUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your FragView account</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#FFF9EF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF9EF;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:#211F1C;border-radius:16px 16px 0 0;">
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
                  <td align="center" style="border-radius:8px;background:#211F1C;">
                    <a href="${verificationUrl}" target="_blank" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin:30px 0 10px;color:#6b7280;font-size:14px;line-height:1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 30px;color:#B28845;font-size:13px;word-break:break-all;background:#f3f4f6;padding:12px;border-radius:6px;">
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
                Need help? Contact us at <a href="mailto:support@fragview.com" style="color:#B28845;text-decoration:none;">support@fragview.com</a>
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
}

// ===================================
// WELCOME EMAIL
// ===================================
export async function sendWelcomeEmail(email: string, username: string) {
  try {
    await resend.emails.send({
      from: 'FragView <noreply@fragview.com>',
      to: email,
      subject: 'Welcome to FragView!  🎉',
      html: getWelcomeEmailTemplate(username),
    });
    
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
}

function getWelcomeEmailTemplate(username: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FragView</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#FFF9EF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF9EF;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:#211F1C;border-radius:16px 16px 0 0;">
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
                Hi ${username}! 🎉
              </p>
              
              <p style="margin:0 0 24px;color:#6b7280;font-size:16px;line-height:1.6;">
                Your email has been verified and your account is now active. Welcome to the FragView community!
              </p>
              
              <!-- Feature Cards -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#FFF9EF;border:1px solid #ECE0CF;border-radius:12px;padding:24px;margin:24px 0;">
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
                  <td align="center" style="border-radius:8px;background:#211F1C;">
                    <a href="${BASE_URL}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                      Start Exploring
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.6;text-align:center;">
                Happy fragrance hunting! 🌸<br>
                <strong style="color:#B28845;">The FragView Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#f9fafb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                Need help? Contact us at <a href="mailto:support@fragview.com" style="color:#B28845;text-decoration:none;">support@fragview.com</a>
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
}

// ===================================
// PASSWORD RESET EMAIL
// ===================================
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetCode: string
) {
  const resetUrl = `${BASE_URL}/reset-password?code=${resetCode}`;

  try {
    await resend.emails.send({
      from: 'FragView <noreply@fragview.com>',
      to: email,
      subject: 'Reset your FragView password',
      html: getPasswordResetTemplate(username, resetUrl, resetCode),
    });
    
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
}

function getPasswordResetTemplate(username: string, resetUrl: string, resetCode: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1. 0">
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#FFF9EF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF9EF;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:#211F1C;border-radius:16px 16px 0 0;">
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
                  <td align="center" style="border-radius:8px;background:#211F1C;">
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
                    <p style="margin:0;color:#B28845;font-size:28px;font-weight:700;letter-spacing:6px;">
                      ${resetCode}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin:20px 0 10px;color:#6b7280;font-size:14px;line-height:1.6;">
                Or copy and paste this link:
              </p>
              <p style="margin:0 0 30px;color:#B28845;font-size:13px;word-break:break-all;background:#f3f4f6;padding:12px;border-radius:6px;">
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
                Need help? Contact us at <a href="mailto:support@fragview.com" style="color:#B28845;text-decoration:none;">support@fragview.com</a>
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
}

// ===================================
// 🆕 ADMIN EMAIL TEMPLATES
// ===================================

/**
 * Send submission approved email
 */
export async function sendSubmissionApprovedEmail(
  email: string,
  username: string,
  type: string,
  itemName: string
) {
  const subject = `✅ Your ${type} suggestion was approved! `;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFF9EF;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="background: #211F1C; padding: 40px 30px; text-align: center;">
              ${getLogoHTML()}
              <h1 style="margin: 0; color: white; font-size: 24px;">Submission Approved! </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
                Hi <strong style="color: #211F1C;">${username}</strong>,
              </p>
              <div style="background: #FFF9EF; border: 1px solid #ECE0CF; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                  🎉 Great news! Your ${type. toLowerCase()} suggestion <strong>"${itemName}"</strong> has been approved and added to FragView!
                </p>
                <p style="margin: 16px 0 0 0; color: #1f2937; font-size: 15px;">
                  You've earned <strong>+5 XP</strong> for this contribution!
                </p>
              </div>
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
                Thank you for helping us build the best fragrance community!  🌸<br>
                <strong style="color: #B28845;">The FragView Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
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

  try {
    await resend.emails.send({
      from: 'FragView <noreply@fragview.com>',
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
}

/**
 * Send submission rejected email
 */
export async function sendSubmissionRejectedEmail(
  email: string,
  username: string,
  type: string,
  reason: string
) {
  const subject = `Your ${type} suggestion needs attention`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFF9EF;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0. 08); overflow: hidden;">
          <tr>
            <td style="background: #211F1C; padding: 40px 30px; text-align: center;">
              ${getLogoHTML()}
              <h1 style="margin: 0; color: white; font-size: 24px;">Submission Update</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
                Hi <strong style="color: #211F1C;">${username}</strong>,
              </p>
              <div style="background: #fef3c7; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
                  We've reviewed your ${type.toLowerCase()} suggestion, and unfortunately we cannot approve it at this time.
                </p>
                <p style="margin: 16px 0 0 0; color: #92400e; font-size: 14px;">
                  <strong>Reason:</strong> ${reason}
                </p>
              </div>
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
                Feel free to submit again with updated information!  We appreciate your contribution. <br>
                <strong style="color: #B28845;">The FragView Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
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

  try {
    await resend.emails.send({
      from: 'FragView <noreply@fragview.com>',
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
}

/**
 * Send brand application approved email
 */
export async function sendBrandApplicationApprovedEmail(
  email: string,
  contactName: string,
  brandName: string
) {
  const subject = `✅ ${brandName} - Brand Application Approved! `;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFF9EF;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0. 08); overflow: hidden;">
          <tr>
            <td style="background: #211F1C; padding: 40px 30px; text-align: center;">
              ${getLogoHTML()}
              <h1 style="margin: 0; color: white; font-size: 24px;">Welcome to FragView!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
                Dear <strong style="color: #211F1C;">${contactName}</strong>,
              </p>
              <div style="background: #FFF9EF; border: 1px solid #ECE0CF; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                  🎉 Congratulations! Your brand <strong>"${brandName}"</strong> has been verified and added to FragView!
                </p>
                <p style="margin: 16px 0 0 0; color: #1f2937; font-size: 15px;">
                  Your brand now has a <strong>✓ Verified</strong> badge on the platform.
                </p>
              </div>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${BASE_URL}/brands/${brandName. toLowerCase(). replace(/ /g, '-')}" style="display: inline-block; background: #211F1C; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  View Your Brand Page
                </a>
              </div>
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
                Thank you for joining FragView! <br>
                <strong style="color: #B28845;">The FragView Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
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

  try {
    await resend.emails.send({
      from: 'FragView <noreply@fragview.com>',
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending brand approval email:', error);
  }
}

/**
 * Send brand application rejected email
 */
export async function sendBrandApplicationRejectedEmail(
  email: string,
  contactName: string,
  brandName: string,
  reason: string
) {
  const subject = `${brandName} - Brand Application Update`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFF9EF;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="background: #211F1C; padding: 40px 30px; text-align: center;">
              ${getLogoHTML()}
              <h1 style="margin: 0; color: white; font-size: 24px;">Application Update</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
                Dear <strong style="color: #211F1C;">${contactName}</strong>,
              </p>
              <div style="background: #fef3c7; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
                  We've reviewed your brand application for <strong>"${brandName}"</strong>, and we need additional information before we can proceed.
                </p>
                <p style="margin: 16px 0 0 0; color: #92400e; font-size: 14px;">
                  <strong>Reason:</strong> ${reason}
                </p>
              </div>
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
                Please feel free to resubmit your application with the requested information.  We're here to help!<br>
                <strong style="color: #B28845;">The FragView Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
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

  try {
    await resend.emails.send({
      from: 'FragView <noreply@fragview.com>',
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending brand rejection email:', error);
  }
}