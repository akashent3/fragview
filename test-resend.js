import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailDetailed() {
  console.log('📧 Resend Email Test (Detailed)\n');
  console.log('═══════════════════════════════════════\n');
  
  // Check API key
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in .env');
    return;
  }
  
  console.log('✅ API Key found:', process.env.RESEND_API_KEY.substring(0, 10) + '...\n');
  
  // IMPORTANT: Change this to YOUR email (the one you used to sign up for Resend)
  const YOUR_EMAIL = 'manthan.patel1488@gmail.com'; // ← CHANGE THIS!
  
  console.log('📨 Sending test email to:', YOUR_EMAIL);
  console.log('📤 From: onboarding@resend.dev\n');
  
  try {
    const data = await resend.emails.send({
      from: 'FragView <onboarding@resend.dev>',
      to: YOUR_EMAIL,
      subject: 'FragView Test Email - ' + new Date().toLocaleString(),
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
              .header h1 { color: #ffffff; margin: 0; font-size: 32px; }
              .content { color: #333333; line-height: 1.6; }
              .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .details { background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #999999; font-size: 12px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✉️ FragView</h1>
              </div>
              
              <div class="content">
                <h2 style="color: #667eea;">Email Service Test Successful!</h2>
                
                <div class="success">
                  <strong>✅ Success!</strong> If you're reading this, Resend email delivery is working correctly.
                </div>
                
                <p>This is a test email from your FragView application to verify that:</p>
                <ul>
                  <li>✅ Resend API key is configured correctly</li>
                  <li>✅ Email sending is functional</li>
                  <li>✅ HTML templates are rendering properly</li>
                </ul>
                
                <div class="details">
                  <strong>Test Details:</strong><br>
                  📅 Sent: ${new Date().toLocaleString()}<br>
                  📧 To: ${YOUR_EMAIL}<br>
                  🔑 API Key: ${process.env.RESEND_API_KEY.substring(0, 15)}...<br>
                  🌍 Environment: ${process.env.NODE_ENV || 'development'}
                </div>
                
                <h3>Next Steps:</h3>
                <ol>
                  <li>Verify this email arrived successfully ✅</li>
                  <li>Check spam folder if not in inbox</li>
                  <li>Verify your domain for production use</li>
                  <li>Implement user verification emails</li>
                </ol>
              </div>
              
              <div class="footer">
                © ${new Date().getFullYear()} FragView - Test Email
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log('═══════════════════════════════════════\n');
    console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
    console.log('📋 Response Details:');
    console.log('   Email ID:', data.id);
    console.log('   From:', data.from || 'onboarding@resend.dev');
    console.log('   To:', data.to);
    console.log('\n⏱️  Delivery Time: Usually 5-30 seconds');
    console.log('\n📥 Check your inbox:');
    console.log('   1. Main inbox folder');
    console.log('   2. Spam/Junk folder');
    console.log('   3. Promotions/Updates tab (Gmail)');
    console.log('\n💡 Still not receiving?');
    console.log('   - Make sure the email matches your Resend signup email');
    console.log('   - Check Resend dashboard: https://resend.com/emails');
    console.log('   - Verify domain for unrestricted sending\n');
    
  } catch (error) {
    console.log('═══════════════════════════════════════\n');
    console.error('❌ EMAIL SENDING FAILED!\n');
    console.error('Error Message:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 Solution:');
      console.log('   1. Go to https://resend.com/api-keys');
      console.log('   2. Generate a new API key');
      console.log('   3. Update your .env file');
    } else if (error.message.includes('not verified')) {
      console.log('\n💡 Solution:');
      console.log('   1. Verify your domain at https://resend.com/domains');
      console.log('   2. Or use the email you signed up with');
    } else {
      console.log('\nFull Error:', error);
    }
  }
}

testEmailDetailed();