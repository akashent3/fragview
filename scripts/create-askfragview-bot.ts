import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function createAskFragviewBot() {
  try {
    // Check if bot already exists
    const existing = await prisma.user.findUnique({
      where: { username: 'askfragview' },
    });

    if (existing) {
      console.log('✅ Bot user already exists:');
      console.log('   ID      :', existing.id);
      console.log('   Username:', existing.username);
      console.log('\n👉 Add this line to your .env:');
      console.log(`   ASKFRAGVIEW_BOT_USER_ID=${existing.id}`);
      return;
    }

    const bot = await prisma.user.create({
      data: {
        username: 'askfragview',
        email: 'bot@fragview.com',
        emailVerified: new Date(),
        bio: 'FragView AI Assistant. Start your review with @askfragview to ask me anything about this fragrance.',
        role: 'USER',
        isActivityPublic: false,
        isWardrobePublic: false,
        emailNotifWeeklyDigest: false,
      },
    });

    console.log('✅ Bot user created successfully!');
    console.log('   ID      :', bot.id);
    console.log('   Username:', bot.username);
    console.log('\n👉 Add this line to your .env:');
    console.log(`   ASKFRAGVIEW_BOT_USER_ID=${bot.id}`);
  } catch (error) {
    console.error('❌ Error creating bot user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAskFragviewBot();
