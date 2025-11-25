'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SubmissionType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// --- Community Submission ---
export async function submitCommunitySuggestion(data: {
  type: 'BRAND' | 'PERFUME';
  name: string;
  brand?: string; // Required if type is PERFUME
  notes?: string;
  link?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'You must be logged in to submit suggestions.' };

  try {
    await prisma.communitySubmission.create({
      data: {
        userId: session.user.id,
        type: data.type as SubmissionType,
        data: {
          name: data.name,
          brand: data.brand,
          link: data.link,
          userNotes: data.notes
        }
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Submission error:', error);
    return { error: 'Failed to submit suggestion.' };
  }
}

// --- Brand Owner Submission ---
export async function submitBrandApplication(formData: FormData) {
  // No login required for brand owners (they might be new to the platform)
  
  const rawData = {
    brandName: formData.get('brandName') as string,
    companyName: formData.get('companyName') as string,
    country: formData.get('country') as string,
    website: formData.get('website') as string,
    contactName: formData.get('contactName') as string,
    contactEmail: formData.get('contactEmail') as string,
    contactPhone: formData.get('contactPhone') as string,
    position: formData.get('position') as string,
    // We'll handle file uploads separately via blob if needed, or just store links for now
    verificationLink: formData.get('verificationLink') as string, 
  };

  if (!rawData.brandName || !rawData.contactEmail || !rawData.contactName) {
    return { error: 'Missing required fields.' };
  }

  try {
    await prisma.brandOwnerSubmission.create({
      data: {
        brandName: rawData.brandName,
        companyName: rawData.companyName,
        country: rawData.country,
        website: rawData.website,
        contactName: rawData.contactName,
        contactEmail: rawData.contactEmail,
        contactPhone: rawData.contactPhone,
        position: rawData.position,
        brandData: {}, // Can be expanded later
        perfumesData: {}, // Can be expanded later
        verificationDocs: rawData.verificationLink ? [rawData.verificationLink] : [],
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Brand submission error:', error);
    return { error: 'Failed to submit application.' };
  }
}