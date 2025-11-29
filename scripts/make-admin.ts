import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = 'info@fragview.com'; // 👈 REPLACE WITH YOUR EMAIL
  
  try {
    const user = await prisma.user. update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    
    console.log('✅ User promoted to ADMIN:', user. email);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();