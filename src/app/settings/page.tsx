import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Settings | FragView',
  description: 'Manage your account settings',
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (! session?.user) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      image: true,
      bio: true,
      location: true,
      isWardrobePublic: true,
      isActivityPublic: true,
      // 🆕 Email notification preferences (only 2 fields now)
      emailNotifWeeklyDigest: true,
      unsubscribedFromAll: true,
    },
  });

  if (!user) {
    redirect('/');
  }

  return <SettingsClient user={user} />;
}