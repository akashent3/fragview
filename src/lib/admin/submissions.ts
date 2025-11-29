import prisma from '@/lib/prisma';
import { connectMongoDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logAdminAction } from './stats';
import { sendSubmissionApprovedEmail, sendSubmissionRejectedEmail } from '@/lib/email';

/**
 * Get all community submissions with filters
 */
export async function getSubmissions({
  status,
  type,
}: {
  status?: string;
  type?: string;
}) {
  const where: any = {};
  
  if (status && status !== 'all') {
    where.status = status;
  }
  
  if (type && type !== 'all') {
    where.type = type;
  }

  const submissions = await prisma. communitySubmission.findMany({
    where,
    include: {
      user: {
        select: {
          username: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return submissions;
}

/**
 * Get single submission by ID
 */
export async function getSubmissionById(id: string) {
  const submission = await prisma.communitySubmission.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          username: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return submission;
}

/**
 * Approve submission and add to database with minimal data
 */
export async function approveSubmissionAction(
  submissionId: string,
  data: any,
  adminNotes: string,
  adminId: string
) {
  try {
    const submission = await prisma.communitySubmission.findUnique({
      where: { id: submissionId },
      include: { user: true },
    });

    if (! submission) {
      return { success: false, error: 'Submission not found' };
    }

    if (submission.status !== 'PENDING') {
      return { success: false, error: 'Submission already processed' };
    }

    const { db } = await connectMongoDB();
    let mongoId: string | null = null;

    // Add to MongoDB based on type
    if (submission. type === 'PERFUME') {
      // ✅ Create perfume with minimal data + enrichment flag
      const perfumeData = {
        // Required fields from submission
        name: data.name,
        brand_name: data.brand,
        
        // Optional fields from submission (if provided)
        gender: data.gender || 'Unisex',
        concentration: data.concentration || 'Eau de Parfum',
        description: data.description || '',
        launch_year: data.launchYear ?  parseInt(data.launchYear) : null,
        perfumer: data.perfumer || null,
        
        // Notes (if provided, else empty arrays)
        notes: {
          top: Array.isArray(data.topNotes) ? data.topNotes : [],
          middle: Array.isArray(data. middleNotes) ? data. middleNotes : [],
          base: Array.isArray(data. baseNotes) ? data.baseNotes : [],
        },
        
        // Accords (if provided, else empty)
        accords: Array.isArray(data.accords) ? data.accords : [],
        
        // Placeholder/Empty fields
        image: data.imageUrl || null,
        rating: 0,
        review_count: 0,
        
        // ✅ Metadata & Enrichment Flags
        created_at: new Date(),
        updated_at: new Date(),
        added_by: 'community',
        needs_enrichment: true, // ✅ Flag for admin attention
        submitted_by_user_id: submission.userId,
        submission_id: submissionId,
        enrichment_status: 'pending', // pending, in_progress, completed
        missing_fields: calculateMissingFields({
          image: data.imageUrl,
          description: data.description,
          notes: {
            top: data.topNotes || [],
            middle: data.middleNotes || [],
            base: data.baseNotes || [],
          },
          accords: data.accords || [],
          perfumer: data.perfumer,
        }),
      };

      const result = await db.collection('perfumes').insertOne(perfumeData);
      mongoId = result.insertedId.toString();
      
      console.log('✅ Perfume created in MongoDB:', mongoId);
      console.log('📝 Missing fields:', perfumeData.missing_fields);
      
    } else if (submission.type === 'BRAND') {
      // ✅ Create brand with minimal data + enrichment flag
      const brandData = {
        // Required fields
        name: data.brandName,
        
        // Optional fields from submission
        country: data.country || null,
        description: data.description || '',
        founded_year: data.foundedYear ? parseInt(data.foundedYear) : null,
        website: data.website || null,
        
        // Placeholder fields
        logo: data.logoUrl || null,
        
        // ✅ Metadata & Enrichment Flags
        created_at: new Date(),
        updated_at: new Date(),
        added_by: 'community',
        needs_enrichment: true, // ✅ Flag for admin attention
        submitted_by_user_id: submission.userId,
        submission_id: submissionId,
        enrichment_status: 'pending',
        missing_fields: calculateMissingFields({
          logo: data.logoUrl,
          description: data.description,
          founded_year: data.foundedYear,
          website: data.website,
        }),
      };

      const result = await db.collection('brands').insertOne(brandData);
      mongoId = result. insertedId.toString();
      
      console.log('✅ Brand created in MongoDB:', mongoId);
      console.log('📝 Missing fields:', brandData. missing_fields);
    }

    // Update submission status in PostgreSQL
    await prisma.communitySubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        adminNotes,
        processedAt: new Date(),
      },
    });

    // Award XP to user
    await prisma.user.update({
      where: { id: submission.userId },
      data: {
        experiencePoints: {
          increment: 5, // +5 XP for approved submission
        },
      },
    });

    // Log admin action
    await logAdminAction(
      adminId,
      'APPROVE_SUBMISSION',
      submission.type,
      submissionId,
      { 
        submissionType: submission.type, 
        itemName: data.name || data.brandName,
        mongoId,
      }
    );

    // Send approval email
    await sendSubmissionApprovedEmail(
      submission.user.email,
      submission.user.username,
      submission.type,
      data.name || data.brandName
    );

    // Create notification
    await prisma.notification.create({
      data: {
        userId: submission.userId,
        type: 'SUBMISSION_APPROVED',
        message: `Your ${submission.type. toLowerCase()} suggestion "${data.name || data.brandName}" has been approved!  You earned +5 XP.`,
        link: submission.type === 'PERFUME' ?  `/perfumes/${data.name}` : `/brands/${data.brandName}`,
      },
    });

    return { success: true, mongoId };
  } catch (error) {
    console.error('Error approving submission:', error);
    return { success: false, error: 'Failed to approve submission' };
  }
}

/**
 * Reject submission
 */
export async function rejectSubmissionAction(
  submissionId: string,
  reason: string,
  adminId: string
) {
  try {
    const submission = await prisma.communitySubmission.findUnique({
      where: { id: submissionId },
      include: { user: true },
    });

    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    if (submission.status !== 'PENDING') {
      return { success: false, error: 'Submission already processed' };
    }

    // Update submission status
    await prisma.communitySubmission.update({
      where: { id: submissionId },
      data: {
        status: 'REJECTED',
        adminNotes: reason,
        processedAt: new Date(),
      },
    });

    // Log admin action
    await logAdminAction(
      adminId,
      'REJECT_SUBMISSION',
      submission.type,
      submissionId,
      { reason }
    );

    // Send rejection email
    await sendSubmissionRejectedEmail(
      submission.user.email,
      submission.user.username,
      submission.type,
      reason
    );

    // Create notification
    await prisma. notification.create({
      data: {
        userId: submission.userId,
        type: 'SUBMISSION_REJECTED',
        message: `Your ${submission.type. toLowerCase()} suggestion was reviewed.  Reason: ${reason}`,
      },
    });

    return { success: true };
  } catch (error) {
    console. error('Error rejecting submission:', error);
    return { success: false, error: 'Failed to reject submission' };
  }
}

/**
 * Helper: Calculate missing fields for enrichment tracking
 */
function calculateMissingFields(data: any): string[] {
  const missing: string[] = [];
  
  if (! data.image) missing.push('image');
  if (!data.description || data.description === '') missing.push('description');
  
  // For perfumes
  if (data.notes) {
    if (! data.notes.top || data.notes.top.length === 0) missing.push('top_notes');
    if (!data.notes.middle || data.notes.middle.length === 0) missing.push('middle_notes');
    if (!data.notes. base || data.notes.base. length === 0) missing.push('base_notes');
  }
  
  if (! data.accords || data.accords.length === 0) missing.push('accords');
  if (!data.perfumer) missing. push('perfumer');
  
  // For brands
  if (data.logo !== undefined && ! data.logo) missing.push('logo');
  if (data.founded_year !== undefined && !data. founded_year) missing.push('founded_year');
  if (data.website !== undefined && !data.website) missing.push('website');
  
  return missing;
}