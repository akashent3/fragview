import { loadPublicProfile } from './loaders';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PublicProfileClient from './PublicProfileClient';

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata({ params }: { params: { username: string } }) {
  const data = await loadPublicProfile(params.username);
  if (!data) return {};
  
  return {
    title: `@${data.user.username} | FragView`,
    description: data.user.bio || `View ${data.user.username}'s fragrance profile, reviews, and collection on FragView. `,
  };
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?. id;
  
  const data = await loadPublicProfile(params.username, currentUserId);
  
  if (!data) {
    return notFound();
  }
  
  // If viewing your own profile, redirect to /profile
  if (data.privacy.isOwnProfile) {
    redirect('/profile');
  }

  return (
    <div className="min-h-screen bg-[#FAFFF5] py-8">
      <PublicProfileClient 
        profileData={data}
        isSignedIn={!!session?. user}
      />
    </div>
  );
}