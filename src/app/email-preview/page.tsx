/**
 * DEV-ONLY email preview page – not linked from anywhere in production.
 * Visit /email-preview?type=verification|welcome|reset|approved|rejected|weekly
 * to render each template in the browser for visual QA / screenshots.
 */
import { NextRequest } from "next/server";

const BASE_URL = "http://localhost:3000";
const LOGO_URL = `${BASE_URL}/Logo.png`;
const LOGO_WIDTH = 160;

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

// ---------- Template builders ----------

function verificationHtml() {
  const verificationUrl = `${BASE_URL}/verify-email?token=SAMPLE_TOKEN`;
  return `<!DOCTYPE html>
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
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:#211F1C;border-radius:16px 16px 0 0;">
              ${getLogoHTML()}
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;text-align:center;">Verify Your Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 10px;color:#1f2937;font-size:18px;font-weight:600;">Hi JohnDoe! 👋</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:16px;line-height:1.6;">
                Thank you for joining FragView, the fragrance community. To get started discovering amazing scents, please verify your email address.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:30px 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:#211F1C;">
                    <a href="${verificationUrl}" target="_blank" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              <p style="margin:30px 0 10px;color:#6b7280;font-size:14px;line-height:1.6;">Or copy and paste this link into your browser:</p>
              <p style="margin:0 0 30px;color:#B28845;font-size:13px;word-break:break-all;background:#f3f4f6;padding:12px;border-radius:6px;">${verificationUrl}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">
              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                ⏱️ This link will expire in <strong>24 hours</strong>.<br>
                If you didn't create a FragView account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#f9fafb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Need help? Contact us at <a href="mailto:support@fragview.com" style="color:#B28845;text-decoration:none;">support@fragview.com</a></p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 FragView. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function welcomeHtml() {
  return `<!DOCTYPE html>
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
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:#211F1C;border-radius:16px 16px 0 0;">
              ${getLogoHTML()}
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;text-align:center;">Welcome to FragView!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:16px;text-align:center;">Your fragrance journey starts here</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 10px;color:#1f2937;font-size:20px;font-weight:600;">Hi JohnDoe! 🎉</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:16px;line-height:1.6;">Your email has been verified and your account is now active. Welcome to the FragView community!</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#FFF9EF;border:1px solid #ECE0CF;border-radius:12px;padding:24px;margin:24px 0;">
                <tr>
                  <td>
                    <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">Get Started:</h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr><td style="padding:8px 0;color:#374151;font-size:15px;"><span style="font-size:20px;margin-right:8px;">📝</span>Write your first perfume review</td></tr>
                      <tr><td style="padding:8px 0;color:#374151;font-size:15px;"><span style="font-size:20px;margin-right:8px;">👃</span>Explore 166,000+ perfumes from 14,000+ brands</td></tr>
                      <tr><td style="padding:8px 0;color:#374151;font-size:15px;"><span style="font-size:20px;margin-right:8px;">💼</span>Build your perfume wardrobe</td></tr>
                      <tr><td style="padding:8px 0;color:#374151;font-size:15px;"><span style="font-size:20px;margin-right:8px;">👥</span>Follow other fragrance enthusiasts</td></tr>
                      <tr><td style="padding:8px 0;color:#374151;font-size:15px;"><span style="font-size:20px;margin-right:8px;">🏆</span>Earn XP and unlock badges</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:#211F1C;">
                    <a href="${BASE_URL}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">Start Exploring</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.6;text-align:center;">Happy fragrance hunting! 🌸<br><strong style="color:#B28845;">The FragView Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#f9fafb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Need help? Contact us at <a href="mailto:support@fragview.com" style="color:#B28845;text-decoration:none;">support@fragview.com</a></p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 FragView. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function resetHtml() {
  const resetUrl = `${BASE_URL}/reset-password?code=ABC123`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#FFF9EF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF9EF;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:#211F1C;border-radius:16px 16px 0 0;">
              ${getLogoHTML()}
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;text-align:center;">Password Reset</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 10px;color:#1f2937;font-size:18px;font-weight:600;">Hi JohnDoe,</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:16px;line-height:1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:30px 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:#211F1C;">
                    <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">Or use this code:</p>
                    <p style="margin:0;color:#B28845;font-size:28px;font-weight:700;letter-spacing:6px;">ABC123</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:4px;margin:20px 0;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;color:#991b1b;font-size:14px;font-weight:600;">⚠️ Security Notice</p>
                    <p style="margin:0;color:#7f1d1d;font-size:13px;line-height:1.6;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#f9fafb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Need help? Contact us at <a href="mailto:support@fragview.com" style="color:#B28845;text-decoration:none;">support@fragview.com</a></p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 FragView. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function approvedHtml() {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#FFF9EF;">
  <table role="presentation" style="width:100%;border-collapse:collapse;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width:600px;width:100%;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:#211F1C;padding:40px 30px;text-align:center;">
              ${getLogoHTML()}
              <h1 style="margin:0;color:white;font-size:24px;">Submission Approved!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hi <strong style="color:#211F1C;">JohnDoe</strong>,</p>
              <div style="background:#FFF9EF;border:1px solid #ECE0CF;border-radius:12px;padding:24px;margin:24px 0;">
                <p style="margin:0;color:#1f2937;font-size:15px;line-height:1.6;">🎉 Great news! Your perfume suggestion <strong>"Bleu de Chanel"</strong> has been approved and added to FragView!</p>
                <p style="margin:16px 0 0;color:#1f2937;font-size:15px;">You've earned <strong>+5 XP</strong> for this contribution!</p>
              </div>
              <p style="margin:24px 0 0;color:#6b7280;font-size:14px;">Thank you for helping us build the best fragrance community! 🌸<br><strong style="color:#B28845;">The FragView Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:24px 30px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">FragView • Your trusted fragrance community</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function weeklyHtml() {
  const unsubscribeUrl = `${BASE_URL}/settings#notifications`;
  const notifItems = [
    { icon: "👤", msg: "AromaNerd started following you" },
    { icon: "❤️", msg: "ScentSeeker liked your review of Sauvage Dior" },
    { icon: "💬", msg: "FragFan replied to your review: \"Great analysis!\"" },
    { icon: "🆕", msg: "New release: Chanel No.5 L'Eau Intense" },
    { icon: "👍", msg: "3 people found your review helpful" },
  ];
  const notifRows = notifItems.map(n => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f3f4f6;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="40" style="vertical-align:top;"><span style="font-size:24px;">${n.icon}</span></td>
            <td style="vertical-align:top;">
              <p style="margin:0 0 4px;color:#1f2937;font-size:14px;line-height:1.5;">${n.msg}</p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">Mar 8</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html>
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
          <tr>
            <td align="center" style="padding:50px 40px 30px;background:#211F1C;border-radius:16px 16px 0 0;">
              ${getLogoHTML()}
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;text-align:center;">📬 Your Weekly Digest</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;text-align:center;">What happened this week on FragView</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hi <strong style="color:#211F1C;">JohnDoe</strong>,</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">Here's your weekly summary of activity on FragView:</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td width="48%" style="padding:16px;background:#FFF9EF;border:1px solid #ECE0CF;border-radius:8px;vertical-align:top;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-align:center;">New Perfumes</p>
                    <p style="margin:0;color:#1f2937;font-size:24px;font-weight:700;text-align:center;">12</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding:16px;background:#FFF9EF;border:1px solid #ECE0CF;border-radius:8px;vertical-align:top;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-align:center;">New Reviews</p>
                    <p style="margin:0;color:#1f2937;font-size:24px;font-weight:700;text-align:center;">47</p>
                  </td>
                </tr>
              </table>
              <h3 style="margin:0 0 16px;color:#1f2937;font-size:18px;font-weight:600;">Your Activity (5)</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                ${notifRows}
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
                <tr>
                  <td align="center" style="border-radius:8px;background:#211F1C;">
                    <a href="${BASE_URL}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">Explore FragView</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.6;text-align:center;">Keep discovering amazing fragrances! 🌸</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:24px 30px;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 12px;color:#6b7280;font-size:12px;line-height:1.5;text-align:center;">
                <a href="${unsubscribeUrl}" style="color:#B28845;text-decoration:none;">Email Preferences</a> •
                <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:none;">Unsubscribe from Digest</a>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;">FragView • Your trusted fragrance community</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------- Page component ----------

const templates: Record<string, () => string> = {
  verification: verificationHtml,
  welcome: welcomeHtml,
  reset: resetHtml,
  approved: approvedHtml,
  weekly: weeklyHtml,
};

const labels: Record<string, string> = {
  verification: "Email Verification",
  welcome: "Welcome Email",
  reset: "Password Reset",
  approved: "Submission Approved",
  weekly: "Weekly Digest",
};

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type: typeParam } = await searchParams;
  const type = typeParam ?? "verification";
  const builder = templates[type] ?? templates.verification;
  const html = builder();

  return (
    <div>
      {/* Nav bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "#211F1C",
          padding: "10px 20px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: "#B28845", fontWeight: 700, marginRight: 8 }}>
          📧 Email Preview
        </span>
        {Object.entries(labels).map(([key, label]) => (
          <a
            key={key}
            href={`/email-preview?type=${key}`}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: type === key ? "#B28845" : "rgba(255,255,255,0.1)",
              color: type === key ? "#211F1C" : "#fff",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Rendered email */}
      <div
        style={{ paddingTop: 52 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
