import prisma from '@/lib/prisma';
import { connectMongoDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logAdminAction } from './stats';
import { sendBrandApplicationApprovedEmail, sendBrandApplicationRejectedEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';
import { toKebab } from '@/lib/slug';


/**
 * Get all brand owner applications
 */
export async function getBrandApplications({ status }: { status?: string }) {
  const where: any = {};
  
  if (status && status !== 'all') {
    where.status = status;
  }

  const applications = await prisma.brandOwnerSubmission.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return applications;
}

/**
 * Get single application by ID
 */
export async function getBrandApplicationById(id: string) {
  const application = await prisma.brandOwnerSubmission.findUnique({
    where: { id },
  });

  return application;
}

/**
 * Approve brand application
 */
export async function approveBrandApplicationAction(
  applicationId: string,
  adminNotes: string,
  adminId: string
) {
  try {
    const application = await prisma.brandOwnerSubmission.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return { success: false, error: 'Application not found' };
    }

    if (application.status !== 'PENDING') {
      return { success: false, error: 'Application already processed' };
    }

    const { db } = await connectMongoDB();

    // ✅ Create brand with available data
    const brandData = application.brandData as any;
    const perfumesData = application.perfumesData as any;

    const brandResult = await db.collection('brands'). insertOne({
      // Required fields
      name: application.brandName,
      
      // Optional fields
      country: application.country,
      description: brandData.description || '',
      founded_year: brandData.foundedYear ? parseInt(brandData.foundedYear) : null,
      website: application.website,
      logo: brandData.logo || null,
      
      // Brand owner specific
      verified: true, // ✅ Verified brand owner
      owner_email: application.contactEmail,
      owner_contact_name: application.contactName,
      
      // ✅ Metadata & Enrichment Flags
      created_at: new Date(),
      updated_at: new Date(),
      added_by: 'brand_owner',
      needs_enrichment: ! brandData.logo || ! brandData.description, // Check if needs enrichment
      application_id: applicationId,
      enrichment_status: (! brandData.logo || !brandData.description) ? 'pending' : 'completed',
      missing_fields: calculateBrandMissingFields({
        logo: brandData.logo,
        description: brandData.description,
        founded_year: brandData.foundedYear,
      }),
    });

    console.log('✅ Brand created:', brandResult.insertedId.toString());

    // ✅ Insert perfumes if provided
    let perfumeCount = 0;
    if (Array.isArray(perfumesData) && perfumesData.length > 0) {
      const perfumesToInsert = perfumesData. map((perfume: any) => ({
        // Required fields
        name: perfume.name,
        brand_name: application.brandName,
        brand_id: brandResult.insertedId. toString(),
        
        // Optional fields
        gender: perfume. gender || 'Unisex',
        concentration: perfume. concentration || 'Eau de Parfum',
        description: perfume.description || '',
        launch_year: perfume.launchYear ? parseInt(perfume.launchYear) : null,
        perfumer: perfume.perfumer || null,
        
        // Notes and accords (if provided)
        notes: perfume.notes || { top: [], middle: [], base: [] },
        accords: perfume.accords || [],
        
        // Placeholder fields
        image: perfume. image || null,
        rating: 0,
        review_count: 0,
        
        // ✅ Metadata & Enrichment Flags
        created_at: new Date(),
        updated_at: new Date(),
        added_by: 'brand_owner',
        needs_enrichment: ! perfume.image || !perfume.description || 
                         (! perfume.notes?.top?. length && !perfume.notes?. middle?.length && !perfume. notes?.base?.length),
        brand_verified: true, // From verified brand owner
        application_id: applicationId,
        enrichment_status: 'pending',
        missing_fields: calculatePerfumeMissingFields(perfume),
      }));

      const perfumesResult = await db. collection('perfumes').insertMany(perfumesToInsert);
      perfumeCount = perfumesResult.insertedCount;
      
      console.log(`✅ Inserted ${perfumeCount} perfumes for brand ${application.brandName}`);
            // 🔔 Notify users who follow this brand about the new perfumes
      if (perfumeCount > 0) {
        try {
          const brandFollowers = await prisma.brandFollow.findMany({
            where: { brandId: brandResult.insertedId.toString() },
            select: { userId: true },
          });
          if (brandFollowers.length > 0) {
            const brandSlug = toKebab(application.brandName);
            for (const follower of brandFollowers) {
              await createNotification({
                userId: follower.userId,
                type: 'BRAND_NEW_RELEASE',
                message: `${application.brandName} just added ${perfumeCount} new perfume${perfumeCount > 1 ? 's' : ''} to FragView!`,
                link: `/brands/${brandSlug}`,
                sendEmail: false,
              });
            }
            console.log(`🔔 Notified ${brandFollowers.length} follower(s) for brand ${application.brandName}`);
          }
        } catch (notifError) {
          // Non-critical: don't fail the approval if notifications fail
          console.error('Failed to create brand new release notifications:', notifError);
        }
      } 
    }

    // Update application status
    await prisma.brandOwnerSubmission.update({
      where: { id: applicationId },
      data: {
        status: 'APPROVED',
        adminNotes,
        processedAt: new Date(),
      },
    });

    // Log admin action
    await logAdminAction(
      adminId,
      'APPROVE_BRAND_APPLICATION',
      'BRAND',
      applicationId,
      { 
        brandName: application. brandName, 
        perfumeCount,
        brandId: brandResult.insertedId.toString(),
      }
    );

    // Send approval email
    await sendBrandApplicationApprovedEmail(
      application.contactEmail,
      application.contactName,
      application. brandName
    );

    return { success: true, brandId: brandResult.insertedId.toString(), perfumeCount };
  } catch (error) {
    console.error('Error approving brand application:', error);
    return { success: false, error: 'Failed to approve application' };
  }
}

/**
 * Reject brand application
 */
export async function rejectBrandApplicationAction(
  applicationId: string,
  reason: string,
  adminId: string
) {
  try {
    const application = await prisma.brandOwnerSubmission.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return { success: false, error: 'Application not found' };
    }

    if (application.status !== 'PENDING') {
      return { success: false, error: 'Application already processed' };
    }

    // Update application status
    await prisma.brandOwnerSubmission.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        adminNotes: reason,
        processedAt: new Date(),
      },
    });

    // Log admin action
    await logAdminAction(
      adminId,
      'REJECT_BRAND_APPLICATION',
      'BRAND',
      applicationId,
      { reason }
    );

    // Send rejection email
    await sendBrandApplicationRejectedEmail(
      application.contactEmail,
      application.contactName,
      application.brandName,
      reason
    );

    return { success: true };
  } catch (error) {
    console.error('Error rejecting brand application:', error);
    return { success: false, error: 'Failed to reject application' };
  }
}

/**
 * Helper: Calculate missing fields for brands
 */
function calculateBrandMissingFields(data: any): string[] {
  const missing: string[] = [];
  
  if (!data.logo) missing.push('logo');
  if (!data.description || data.description === '') missing.push('description');
  if (!data.founded_year) missing.push('founded_year');
  
  return missing;
}

/**
 * Helper: Calculate missing fields for perfumes
 */
function calculatePerfumeMissingFields(perfume: any): string[] {
  const missing: string[] = [];
  
  if (!perfume.image) missing.push('image');
  if (!perfume. description || perfume.description === '') missing.push('description');
  if (!perfume.notes?.top || perfume.notes.top. length === 0) missing.push('top_notes');
  if (!perfume.notes?.middle || perfume.notes.middle.length === 0) missing.push('middle_notes');
  if (! perfume.notes?.base || perfume.notes.base.length === 0) missing.push('base_notes');
  if (!perfume.accords || perfume.accords. length === 0) missing.push('accords');
  if (! perfume.perfumer) missing. push('perfumer');
  
  return missing;
}