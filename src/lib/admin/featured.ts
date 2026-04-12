import prisma from '@/lib/prisma';
import { connectMongoDB } from '@/lib/mongodb'; // ✅ FIXED IMPORT
import { ObjectId } from 'mongodb'; // ✅ ADDED IMPORT
import { logAdminAction } from './stats';

/**
 * Get current featured content
 */
export async function getFeaturedContent() {
  try {
    const [featuredPerfumes, trendingBrands] = await Promise.all([
      prisma.featuredPerfume.findMany({
        orderBy: { position: 'asc' },
      }),
      prisma.trendingBrand.findMany({
        orderBy: { position: 'asc' },
      }),
    ]);

    const { db } = await connectMongoDB(); // ✅ FIXED FUNCTION NAME

    // Fetch perfume details from MongoDB
    const perfumeDetails = await Promise.all(
      featuredPerfumes.map(async (fp) => {
        // ✅ CONVERT STRING TO OBJECTID
        const perfume = await db.collection('perfumes').findOne({ 
          _id: new ObjectId(fp.perfumeId) 
        });
        return {
          id: fp.id,
          mongoId: fp.perfumeId,
          name: perfume?.name || perfume?.variant_name || 'Unknown',
          brandName: perfume?.brand_name || '',
          image: perfume?.image || null,
          position: fp.position,
        };
      })
    );

    // Fetch brand details from MongoDB
    const brandDetails = await Promise.all(
      trendingBrands.map(async (tb) => {
        // ✅ CONVERT STRING TO OBJECTID
        const brand = await db.collection('brands').findOne({ 
          _id: new ObjectId(tb.brandId) 
        });
        return {
          id: tb.id,
          mongoId: tb.brandId,
          name: brand?.name || 'Unknown',
          image: brand?.logo || null,
          position: tb.position,
        };
      })
    );

    return {
      featuredPerfumes: perfumeDetails,
      trendingBrands: brandDetails,
    };
  } catch (error) {
    console.error('Error fetching featured content:', error);
    return {
      featuredPerfumes: [],
      trendingBrands: [],
    };
  }
}

/**
 * Set featured perfumes
 */
export async function setFeaturedPerfumesAction(perfumeIds: string[], adminId: string) {
  try {
    // Delete existing featured perfumes
    await prisma.featuredPerfume.deleteMany({});

    // Insert new ones with positions
    await Promise.all(
      perfumeIds.map((perfumeId, index) =>
        prisma.featuredPerfume.create({
          data: {
            perfumeId,
            position: index,
          },
        })
      )
    );

    // Log admin action
    await logAdminAction(
      adminId,
      'SET_FEATURED',
      'PERFUME',
      perfumeIds.join(','),
      { count: perfumeIds.length }
    );

    return { success: true };
  } catch (error) {
    console.error('Error setting featured perfumes:', error);
    return { success: false, error: 'Failed to update featured perfumes' };
  }
}

/**
 * Set trending brands
 */
export async function setTrendingBrandsAction(brandIds: string[], adminId: string) {
  try {
    // Delete existing trending brands
    await prisma.trendingBrand.deleteMany({});

    // Insert new ones with positions
    await Promise.all(
      brandIds.map((brandId, index) =>
        prisma.trendingBrand.create({
          data: {
            brandId,
            position: index,
          },
        })
      )
    );

    // Log admin action
    await logAdminAction(
      adminId,
      'SET_FEATURED',
      'BRAND',
      brandIds.join(','),
      { count: brandIds.length }
    );

    return { success: true };
  } catch (error) {
    console.error('Error setting trending brands:', error);
    return { success: false, error: 'Failed to update trending brands' };
  }
}

/**
 * Search perfumes for featured selection
 */
export async function searchPerfumesForFeatured(query: string) {
  try {
    const { db } = await connectMongoDB();

    const tokens = query.trim().split(/\s+/).filter(Boolean);

    // Each token must match at least one of the name fields (AND across tokens, OR across fields)
    const tokenConditions = tokens.map(token => ({
      $or: [
        { variant_name: { $regex: token, $options: 'i' } },
        { name: { $regex: token, $options: 'i' } },
        { brand_name: { $regex: token, $options: 'i' } },
      ],
    }));

    const perfumes = await db
      .collection('perfumes')
      .find({ $and: tokenConditions })
      .limit(20)
      .toArray();

    return perfumes;
  } catch (error) {
    console.error('Error searching perfumes:', error);
    return [];
  }
}

/**
 * Search brands for trending selection
 */
export async function searchBrandsForFeatured(query: string) {
  try {
    const { db } = await connectMongoDB(); // ✅ FIXED FUNCTION NAME
    
    const brands = await db
      .collection('brands')
      .find({
        name: { $regex: query, $options: 'i' },
      })
      .limit(20)
      .toArray();

    return brands;
  } catch (error) {
    console.error('Error searching brands:', error);
    return [];
  }
}