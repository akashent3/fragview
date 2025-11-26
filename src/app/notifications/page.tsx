import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import NotificationsClient from './NotificationsClient';

export const metadata = {
  title: 'Notifications | FragView',
  description: 'View all your notifications',
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?. user) {
    redirect('/');
  }

  const notifications = await prisma. notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const serializedNotifications = notifications.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return <NotificationsClient initialNotifications={serializedNotifications} />;
}