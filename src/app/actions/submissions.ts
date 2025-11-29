'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { checkPerfumeExists, checkBrandExists } from '@/lib/duplicate-check';

/**
 * Submit community suggestion (perfume or brand)
 */
export async function submitCommunitySuggestion(data: {
  type: 'PERFUME' | 'BRAND';
  name: string;
  brand?: string;
  link: string;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (! session?.user) {
      return { success: false, error: 'You must be logged in to submit suggestions' };
    }

    // ✅ DUPLICATE CHECK BEFORE SAVING
    if (data.type === 'PERFUME') {
      if (! data.brand) {
        return { success: false, error: 'Brand name is required for perfume suggestions' };
      }

      const duplicateCheck = await checkPerfumeExists(data.name, data.brand);
      
      if (duplicateCheck.exists) {
        return {
          success: false,
          error: 'duplicate',
          duplicate: duplicateCheck.perfume,
          message: `This perfume already exists: ${duplicateCheck.perfume. name} by ${duplicateCheck.perfume.brand_name}`,
        };
      }
    } else if (data.type === 'BRAND') {
      const duplicateCheck = await checkBrandExists(data.name);
      
      if (duplicateCheck.exists) {
        return {
          success: false,
          error: 'duplicate',
          duplicate: duplicateCheck.brand,
          message: `This brand already exists: ${duplicateCheck. brand. name}`,
        };
      }
    }

    // Save to community submissions queue
    await prisma.communitySubmission.create({
      data: {
        userId: session.user. id,
        type: data. type,
        status: 'PENDING',
        data: {
          name: data.name,
          brand: data.brand || null,
          link: data.link,
          notes: data.notes || '',
        },
      },
    });

    revalidatePath('/submit');

    return { success: true };
  } catch (error) {
    console.error('Error submitting community suggestion:', error);
    return { success: false, error: 'Failed to submit suggestion.  Please try again.' };
  }
}

/**
 * Submit brand owner application
 */
export async function submitBrandApplication(formData: FormData) {
  try {
    const brandName = formData.get('brandName') as string;
    const companyName = formData.get('companyName') as string;
    const country = formData. get('country') as string;
    const website = formData.get('website') as string;
    const contactName = formData.get('contactName') as string;
    const contactEmail = formData. get('contactEmail') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const position = formData.get('position') as string;
    const verificationLink = formData.get('verificationLink') as string;

    // Basic validation
    if (!brandName || !country || !website || !contactName || !contactEmail) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    // ✅ DUPLICATE CHECK BEFORE SAVING
    const duplicateCheck = await checkBrandExists(brandName);
    
    if (duplicateCheck.exists) {
      return {
        success: false,
        error: 'duplicate',
        duplicate: duplicateCheck.brand,
        message: `This brand already exists: ${duplicateCheck. brand.name}.  If you are the brand owner, please contact support@fragview.com to claim it.`,
      };
    }

    // Save brand owner application
    await prisma.brandOwnerSubmission.create({
      data: {
        brandName,
        companyName: companyName || brandName,
        country,
        website,
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        position: position || null,
        brandData: {
          verificationLink: verificationLink || null,
        },
        perfumesData: [],
        verificationDocs: verificationLink ? [verificationLink] : [],
        status: 'PENDING',
      },
    });

    revalidatePath('/submit');

    return { success: true };
  } catch (error) {
    console.error('Error submitting brand application:', error);
    return { success: false, error: 'Failed to submit application. Please try again.' };
  }
}