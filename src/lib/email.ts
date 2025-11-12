import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
) {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;

  console.log('📧 Attempting to send verification email...');
  console.log('   To:', email);
  console.log('   Username:', username);
  console.log('   Token:', token.substring(0, 10) + '...');
  console.log('   URL:', verificationUrl);
  console.log('   API Key exists:', !!process.env.RESEND_API_KEY);

  try {
    const { data: result } = await resend.emails.send({
      from: 'FragView <noreply@fragview.com>',
      to: email,
      subject: 'Verify your FragView account',
      html: getVerificationEmailTemplate(username, verificationUrl),
    });
    
    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', result?.id);
    console.log('   Data:', result);
    
    return result;
    
  } catch (error: any) {
    console.error('❌ FAILED to send verification email!');
    console.error('   Error type:', error?.constructor?.name);
    console.error('   Error message:', error?.message);
    console.error('   Full error:', error);
    
    // Re-throw so registration API knows it failed
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
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">FragView</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Welcome, ${username}!</h2>
                    
                    <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                      Thank you for creating a FragView account. To get started, please verify your email address by clicking the button below.
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                      <tr>
                        <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                          <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0 0 20px; color: #667eea; font-size: 14px; word-break: break-all;">
                      ${verificationUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                    
                    <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                      This link will expire in 24 hours. If you didn't create a FragView account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
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

export async function sendWelcomeEmail(email: string, username: string) {
  try {
    await resend.emails.send({
      from: 'FragView <noreply@fragview.com>',
      to: email,
      subject: 'Welcome to FragView!',
      html: getWelcomeEmailTemplate(username),
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

function getWelcomeEmailTemplate(username: string) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px;">
          <h1 style="color: #667eea;">Welcome to FragView, ${username}! 🎉</h1>
          
          <p>Your email has been verified and your account is now active.</p>
          
          <h2>Get Started:</h2>
          <ul>
            <li>📝 Write your first perfume review</li>
            <li>👃 Explore 166,000+ perfumes from 14,000+ brands</li>
            <li>💼 Build your perfume wardrobe</li>
            <li>👥 Follow other fragrance enthusiasts</li>
          </ul>
          
          <a href="${BASE_URL}" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Start Exploring
          </a>
          
          <p style="margin-top: 30px; color: #666666; font-size: 14px;">
            Happy fragrance hunting! 🌸
          </p>
        </div>
      </body>
    </html>
  `;
}