import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6-digit code
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not (security)
      return NextResponse.json({ 
        message: 'If an account exists with this email, you will receive a reset code.' 
      });
    }

    // Generate reset code
    const code = generateResetCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete old unused codes for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email, used: false },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: { email, code, expires },
    });

    // Send email with code
    try {
      await resend.emails.send({
        from: 'FragView <noreply@fragview.com>',
        to: email,
        subject: 'Reset Your FragView Password',
        html: getResetEmailTemplate(user.username, code),
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json({ 
        error: 'Failed to send reset code. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive a reset code.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong. Please try again.' 
    }, { status: 500 });
  }
}

function getResetEmailTemplate(username: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
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
                    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Reset Your Password</h2>
                    
                    <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                      Hi ${username},
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                      We received a request to reset your FragView password. Use the code below to reset your password:
                    </p>
                    
                    <!-- Reset Code -->
                    <div style="background: #f7f7f7; border-radius: 8px; padding: 24px; text-align: center; margin: 30px 0;">
                      <div style="font-size: 14px; color: #666666; margin-bottom: 8px;">Your Reset Code</div>
                      <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${code}
                      </div>
                    </div>
                    
                    <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                      This code will expire in <strong>15 minutes</strong>.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                    
                    <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © 2025 FragView. All rights reserved.
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