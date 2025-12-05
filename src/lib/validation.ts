import { z } from 'zod';

// ✅ Review validation
export const reviewSchema = z.object({
  perfumeId: z.string().min(1).max(500),
  rating: z.number().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  text: z.string().min(10).max(5000),
  longevity: z.number().min(1).max(5).optional(),
  sillage: z.number().min(1).max(5).optional(),
  photos: z.array(z.string().url()).max(3).default([]),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

// ✅ Review update validation
export const reviewUpdateSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  text: z.string().min(10).max(5000).optional(),
  longevity: z.number().min(1).max(5).optional(),
  sillage: z.number().min(1).max(5).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// ✅ Rating validation
export const ratingSchema = z.object({
  perfumeId: z.string().min(1).max(500),
  rating: z.number().min(1).max(5),
});

// ✅ Wardrobe validation
export const wardrobeSchema = z.object({
  perfumeId: z.string().min(1).max(500),
  subcategory: z.string().max(100).optional(),
  status: z.enum(['CURRENTLY_USING', 'WISH_LIST', 'USED_UP', 'IN_COLLECTION', 'GIFTED', 'DECANT']),
  notes: z.string().max(1000).optional(),
});

// ✅ Search validation
export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  page: z.number().min(1).max(1000).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// ✅ Similar fragrance vote validation
export const similarVoteSchema = z.object({
  sourcePerfumeId: z.string().min(1).max(500),
  similarPerfumeId: z.string().min(1).max(500),
  voteType: z.enum(['UP', 'DOWN']),
});

// ✅ Similar fragrance add validation
export const similarAddSchema = z.object({
  sourcePerfumeId: z.string().min(1).max(500),
  targetPerfumeId: z.string().min(1).max(500),
});

// ✅ Follow/Unfollow validation
export const followSchema = z.object({
  userId: z.string().uuid(),
});

// ✅ Brand follow validation
export const brandFollowSchema = z.object({
  brandId: z.string().min(1).max(500),
  brandName: z.string().min(1).max(200),
});

// ✅ Review helpful validation
export const reviewHelpfulSchema = z.object({
  reviewId: z.string().uuid(),
});

// ✅ Notification mark read validation
export const notificationReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
  markAllAsRead: z.boolean().optional(),
});

// ✅ Settings update validation
export const settingsSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  isActivityPublic: z.boolean().optional(),
  isWardrobePublic: z.boolean().optional(),
  emailNotifWeeklyDigest: z.boolean().optional(),
});

// ✅ Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ✅ Sanitize user input
export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 5000);
}

// ✅ Validate MongoDB ObjectId format
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}